import { BadRequestException, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
    apiVersion: '2024-06-20',
  });

  constructor(private prisma: PrismaService) {}

  async getStatus(userId: string) {
    const sub = await this.prisma.subskrypcja.findUnique({ where: { userId } });
    return sub;
  }

  async createCheckout(userId: string) {
    const priceId = process.env.STRIPE_PRICE_ID_PRO;
    if (!priceId) {
      throw new BadRequestException('Brak konfiguracji planu Pro.');
    }
    const user = await this.prisma.uzytkownik.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException('Nie znaleziono użytkownika.');
    }
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.APP_URL}/ustawienia/subskrypcja?status=success`,
      cancel_url: `${process.env.APP_URL}/ustawienia/subskrypcja?status=cancel`,
    });
    return { url: session.url };
  }

  async createPortal(userId: string) {
    const sub = await this.prisma.subskrypcja.findUnique({ where: { userId } });
    if (!sub?.stripeCustomerId) {
      throw new BadRequestException('Brak aktywnego klienta Stripe.');
    }
    const session = await this.stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${process.env.APP_URL}/ustawienia/subskrypcja`,
    });
    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string | undefined) {
    if (!signature) {
      throw new BadRequestException('Brak podpisu Stripe.');
    }
    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? '',
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (
          session.customer &&
          session.subscription &&
          session.customer_email
        ) {
          const user = await this.prisma.uzytkownik.findUnique({
            where: { email: session.customer_email },
          });
          if (user) {
            await this.prisma.subskrypcja.upsert({
              where: { userId: user.id },
              update: {
                plan: 'PRO',
                status: 'AKTYWNA',
                stripeCustomerId: String(session.customer),
                stripeSubscriptionId: String(session.subscription),
              },
              create: {
                userId: user.id,
                plan: 'PRO',
                status: 'AKTYWNA',
                stripeCustomerId: String(session.customer),
                stripeSubscriptionId: String(session.subscription),
              },
            });
          }
        }
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await this.prisma.subskrypcja.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: sub.status === 'active' ? 'AKTYWNA' : 'WSTRZYMANA',
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await this.prisma.subskrypcja.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: 'ANULOWANA', plan: 'FREE' },
        });
        break;
      }
      case 'invoice.paid':
      case 'invoice.payment_failed':
        break;
      default:
        break;
    }

    return { received: true };
  }
}


