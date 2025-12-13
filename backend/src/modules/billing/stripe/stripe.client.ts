import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeClient {
  private readonly logger = new Logger(StripeClient.name);
  public readonly stripe: Stripe;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.getOrThrow<string>('STRIPE_SECRET_KEY');
    
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16', // Use a fixed version for stability
      typescript: true,
    });
    
    this.logger.log('Stripe Client initialized');
  }
}