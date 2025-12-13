import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Get, 
  Req, 
  Headers, 
  BadRequestException 
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/auth.decorator';
import { User } from '../users/entities/user.entity';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckout(
    @CurrentUser() user: User,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.billingService.createCheckoutSession(user, dto);
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  async createPortal(@CurrentUser() user: User) {
    return this.billingService.createPortalSession(user);
  }

  @Get('subscription')
  @UseGuards(JwtAuthGuard)
  async getSubscription(@CurrentUser() user: User) {
    return this.billingService.getSubscriptionStatus(user);
  }

  /**
   * Public Endpoint for Stripe Webhooks
   * Note: The body parser is disabled for this route in main.ts
   * We access the raw buffer via `req.rawBody` (custom extension)
   */
  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    
    // In main.ts, we preserved the raw body in req.rawBody
    if (!req.rawBody) {
      throw new BadRequestException('Raw body not available');
    }

    await this.billingService.handleWebhook(signature, req.rawBody);
    return { received: true };
  }
}