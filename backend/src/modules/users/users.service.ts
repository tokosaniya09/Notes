import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  /**
   * Called by AuthModule to create a new user.
   */
  async create(data: any): Promise<User> {
    return this.usersRepository.create(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User> {
    return this.usersRepository.update(id, {
      ...dto,
    });
  }

  async updatePreferences(id: string, dto: UpdatePreferencesDto): Promise<User> {
    return this.usersRepository.update(id, {
      preferences: dto.preferences,
    });
  }
}