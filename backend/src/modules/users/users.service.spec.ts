import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { NotFoundException } from '@nestjs/common';
import { SubscriptionTier } from './entities/user.entity';

declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeEach: any;
declare const jest: any;

const mockUsersRepository = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto = { email: 'test@test.com', firstName: 'Test' };
      mockUsersRepository.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto);
      expect(result).toEqual({ id: '1', ...dto });
      expect(mockUsersRepository.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const user = { id: '1', email: 'test@test.com' };
      mockUsersRepository.findById.mockResolvedValue(user);

      const result = await service.findById('1');
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if not found', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSubscription', () => {
    it('should update subscription details', async () => {
      const updateData = { tier: SubscriptionTier.PRO };
      mockUsersRepository.update.mockResolvedValue({ id: '1', ...updateData });

      const result = await service.updateSubscription('1', updateData);
      expect(result.tier).toBe(SubscriptionTier.PRO);
      expect(mockUsersRepository.update).toHaveBeenCalledWith('1', updateData);
    });
  });
});