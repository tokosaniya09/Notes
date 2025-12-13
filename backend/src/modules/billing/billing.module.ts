import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { StripeClient } from './stripe/stripe.client';
import { EntitlementsService } from './entitlements/entitlements.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ConfigModule, UsersModule],
  controllers: [BillingController],
  providers: [
    BillingService, 
    StripeClient, 
    EntitlementsService
  ],
  exports: [EntitlementsService], // Export entitlements for other modules to use
})
export class BillingModule {}