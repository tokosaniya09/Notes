import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';
import { StripeClient } from '../../src/modules/billing/stripe/stripe.client';
import { cleanDatabase } from '../utils/test-utils';
import { SubscriptionTier } from '../../src/modules/billing/types';

declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeAll: any;
declare const beforeEach: any;
declare const afterAll: any;
declare const jest: any;

describe('BillingModule (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Mock Stripe Client
  const mockStripeClient = {
    stripe: {
      webhooks: {
        constructEvent: jest.fn(),
      },
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(StripeClient)
      .useValue(mockStripeClient)
      .compile();

    app = moduleFixture.createNestApplication();
    
    // We need to handle raw body logic similar to main.ts for webhook testing
    // or just mock the constructEvent to return a valid event object regardless of signature
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/billing/webhook (POST) - should activate subscription', async () => {
    // 1. Create User
    const user = await (prisma as any).user.create({
      data: {
        email: 'billing@test.com',
        firstName: 'Billing',
        tier: 'FREE',
      },
    });

    // 2. Mock Stripe Event
    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { userId: user.id },
          subscription: 'sub_123',
          customer: 'cus_123',
        },
      },
    };

    mockStripeClient.stripe.webhooks.constructEvent.mockReturnValue(mockEvent);

    // 3. Send Webhook
    // Note: We are simulating the signature check pass via the mock above
    await (request(app.getHttpServer()) as any)
      .post('/billing/webhook')
      .set('stripe-signature', 'valid_signature')
      .send({}) // Body is ignored due to mock, but required for request
      .expect(201);

    // 4. Verify DB Update
    const updatedUser = await (prisma as any).user.findUnique({ where: { id: user.id } });
    expect(updatedUser.stripeSubscriptionId).toBe('sub_123');
    expect(updatedUser.subscriptionStatus).toBe('active');
  });
});