import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: any): Promise<User> {
    return (this.prisma as any).user.create({
      data,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return (this.prisma as any).user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return (this.prisma as any).user.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: any): Promise<User> {
    return (this.prisma as any).user.update({
      where: { id },
      data,
    });
  }
}