import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';
import { cleanDatabase } from '../utils/test-utils';
import { RegisterDto } from '../../src/modules/auth/dto/login.dto';

declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeAll: any;
declare const beforeEach: any;
declare const afterAll: any;

describe('AuthModule (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      const dto: RegisterDto = {
        email: 'e2e@test.com',
        password: 'password123',
        firstName: 'E2E',
      };

      return (request(app.getHttpServer()) as any)
        .post('/auth/register')
        .send(dto)
        .expect(201)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.user.email).toBe(dto.email);
        });
    });

    it('should fail on duplicate email', async () => {
      const dto: RegisterDto = {
        email: 'duplicate@test.com',
        password: 'password123',
        firstName: 'Dupe',
      };

      // Register first time
      await (request(app.getHttpServer()) as any).post('/auth/register').send(dto).expect(201);

      // Register second time
      return (request(app.getHttpServer()) as any)
        .post('/auth/register')
        .send(dto)
        .expect(409);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login valid user', async () => {
      // Create user
      const registerDto = { email: 'login@test.com', password: 'password123', firstName: 'Login' };
      await (request(app.getHttpServer()) as any).post('/auth/register').send(registerDto);

      // Login
      return (request(app.getHttpServer()) as any)
        .post('/auth/login')
        .send({ email: registerDto.email, password: registerDto.password })
        .expect(200)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
        });
    });

    it('should reject invalid password', async () => {
      // Create user
      const registerDto = { email: 'fail@test.com', password: 'password123', firstName: 'Fail' };
      await (request(app.getHttpServer()) as any).post('/auth/register').send(registerDto);

      return (request(app.getHttpServer()) as any)
        .post('/auth/login')
        .send({ email: registerDto.email, password: 'wrongpassword' })
        .expect(401);
    });
  });
});