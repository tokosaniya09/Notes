import { Test, TestingModule } from '@nestjs/testing';
import { EntitlementsService } from './entitlements.service';
import { SubscriptionTier, User } from '../../users/entities/user.entity';

declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeEach: any;

describe('EntitlementsService', () => {
  let service: EntitlementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntitlementsService],
    }).compile();

    service = module.get<EntitlementsService>(EntitlementsService);
  });

  it('should return FREE limits for default user', () => {
    const user = new User({ tier: SubscriptionTier.FREE });
    const result = service.getEntitlements(user);
    expect(result.tier).toBe(SubscriptionTier.FREE);
    expect(result.features.canUseAdvancedAI).toBe(false);
  });

  it('should return PRO limits for PRO user', () => {
    const user = new User({ tier: SubscriptionTier.PRO });
    const result = service.getEntitlements(user);
    expect(result.tier).toBe(SubscriptionTier.PRO);
    expect(result.features.canUseAdvancedAI).toBe(true);
    expect(result.features.maxStorageBytes).toBeGreaterThan(100 * 1024 * 1024);
  });
});