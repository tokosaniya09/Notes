import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
// @ts-ignore
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    this.logger.log('Connecting to Database...');
    await (this as any).$connect();
    this.logger.log('Database connected successfully.');
  }

  async onModuleDestroy() {
    await (this as any).$disconnect();
    this.logger.log('Database disconnected.');
  }
}