import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeClient } from './stripe/stripe.client';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { User, SubscriptionTier, SubscriptionStatus } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { EntitlementsService } from './entitlements/entitlements.service';
import { BillingResponseDto } from './dto/billing-response.dto';
import { Buffer } from 'buffer';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly stripeClient: StripeClient,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly entitlementsService: EntitlementsService,
  ) {}

  /**
   * Generates a Stripe Checkout Session URL
   */
  async createCheckoutSession(user: User, dto: CreateCheckoutDto): Promise<{ url: string }> {
    const priceId = this.getPriceIdForTier(dto.tier);
    
    if (!priceId) {
      throw new BadRequestException('Invalid subscription tier or plan configuration missing.');
    }

    // Reuse existing customer ID if available, otherwise let Stripe create one (and we link it in webhook)
    // However, for better tracking, we should ideally create customer upfront or pass email.
    let customerId = user.stripeCustomerId;

    if (!customerId) {
        // Create customer in Stripe to ensure we have an ID to link
        const customer = await this.stripeClient.stripe.customers.create({
            email: user.email,
            metadata: {
                userId: user.id,
            }
        });
        customerId = customer.id;
        await this.usersService.updateSubscription(user.id, { stripeCustomerId: customerId });
    }

    const session = await this.stripeClient.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: dto.successUrl || `${this.configService.get('FRONTEND_URL')}/dashboard?checkout=success`,
      cancel_url: dto.cancelUrl || `${this.configService.get('FRONTEND_URL')}/dashboard/billing?checkout=cancel`,
      subscription_data: {
        metadata: {
            userId: user.id,
        }
      },
      metadata: {
          userId: user.id
      }
    });

    return { url: session.url };
  }

  /**
   * Generate Customer Portal URL
   */
  async createPortalSession(user: User): Promise<{ url: string }> {
    if (!user.stripeCustomerId) {
      throw new BadRequestException('No billing account found.');
    }

    const session = await this.stripeClient.stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${this.configService.get('FRONTEND_URL')}/dashboard/billing`,
    });

    return { url: session.url };
  }

  /**
   * Get Current Subscription & Entitlements
   */
  async getSubscriptionStatus(user: User): Promise<BillingResponseDto> {
    const entitlements = this.entitlementsService.getEntitlements(user);
    
    return {
      subscription: {
        tier: user.tier,
        status: user.subscriptionStatus || 'inactive',
        endsAt: user.subscriptionEndsAt,
      },
      entitlements,
    };
  }

  /**
   * WEBHOOK HANDLING
   * Critical section: Idempotent handling of Stripe events.
   */
  async handleWebhook(signature: string, rawBody: Buffer) {
    const webhookSecret = this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
    let event;

    try {
      event = this.stripeClient.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`Processing Stripe Event: ${event.type}`);

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await this.handleCheckoutCompleted(event.data.object);
                break;
            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event.data.object);
                break;
            default:
                this.logger.log(`Unhandled event type ${event.type}`);
        }
    } catch (e) {
        this.logger.error(`Failed to process event ${event.type}`, e);
        // Throwing error causes Stripe to retry. 
        // We generally want to return 200 OK if it's a "business logic" error 
        // that won't be fixed by retrying (e.g. user not found), but throw 
        // if it's a transient db error. 
        throw e;
    }
  }

  private async handleCheckoutCompleted(session: any) {
      const userId = session.metadata?.userId;
      const subscriptionId = session.subscription as string;
      const customerId = session.customer as string;

      if (!userId) {
          this.logger.warn(`Checkout session missing userId metadata: ${session.id}`);
          return;
      }

      this.logger.log(`Checkout completed for user ${userId}`);

      await this.usersService.updateSubscription(userId, {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: SubscriptionStatus.ACTIVE,
      });
  }

  private async handleSubscriptionUpdated(subscription: any) {
      const customerId = subscription.customer as string;
      const user = await this.usersService.findByStripeCustomerId(customerId);

      if (!user) {
          this.logger.warn(`Received subscription update for unknown customer: ${customerId}`);
          return;
      }

      const status = subscription.status;
      const priceId = subscription.items.data[0].price.id;
      
      const config = {
          STRIPE_PRICE_ID_PRO: this.configService.get('STRIPE_PRICE_ID_PRO'),
          STRIPE_PRICE_ID_TEAM: this.configService.get('STRIPE_PRICE_ID_TEAM'),
      };

      const tier = this.entitlementsService.resolveTierFromPriceId(priceId, config);

      await this.usersService.updateSubscription(user.id, {
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: status,
          subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
          tier: status === 'active' || status === 'trialing' ? tier : SubscriptionTier.FREE,
      });
      
      this.logger.log(`Updated subscription for user ${user.id} to ${tier} (${status})`);
  }

  private async handleSubscriptionDeleted(subscription: any) {
      const customerId = subscription.customer as string;
      const user = await this.usersService.findByStripeCustomerId(customerId);

      if (!user) return;

      // Revert to Free
      await this.usersService.updateSubscription(user.id, {
          subscriptionStatus: SubscriptionStatus.CANCELED,
          subscriptionEndsAt: new Date(subscription.current_period_end * 1000), // Access until end of period usually handled by 'updated' with cancel_at_period_end. If actually deleted, it's gone.
          tier: SubscriptionTier.FREE,
      });

      this.logger.log(`Subscription deleted for user ${user.id}. Reverted to FREE.`);
  }

  private getPriceIdForTier(tier: SubscriptionTier): string | null {
    switch (tier) {
      case SubscriptionTier.PRO:
        return this.configService.get('STRIPE_PRICE_ID_PRO');
      case SubscriptionTier.TEAM:
        return this.configService.get('STRIPE_PRICE_ID_TEAM');
      default:
        return null;
    }
  }
}