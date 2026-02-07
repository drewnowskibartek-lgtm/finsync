import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SubscriptionsService } from './subscriptions.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private subs: SubscriptionsService) {}

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Status subskrypcji' })
  async status(@CurrentUser() user: { userId: string }) {
    return this.subs.getStatus(user.userId);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'USER')
  @Throttle({ default: { limit: 3, ttl: 60 } })
  @ApiOperation({ summary: 'Utwórz Stripe Checkout (Pro)' })
  async checkout(@CurrentUser() user: { userId: string }) {
    return this.subs.createCheckout(user.userId);
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'USER')
  @Throttle({ default: { limit: 3, ttl: 60 } })
  @ApiOperation({ summary: 'Portal subskrypcji Stripe' })
  async portal(@CurrentUser() user: { userId: string }) {
    return this.subs.createPortal(user.userId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Webhook Stripe' })
  async webhook(@Req() req: Request) {
    const sig = req.headers['stripe-signature'] as string | undefined;
    return this.subs.handleWebhook(req.body as Buffer, sig);
  }
}
