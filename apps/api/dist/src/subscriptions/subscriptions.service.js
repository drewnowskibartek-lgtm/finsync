"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = require("stripe");
const prisma_service_1 = require("../prisma/prisma.service");
let SubscriptionsService = class SubscriptionsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY ?? '', {
            apiVersion: '2024-06-20',
        });
    }
    async getStatus(userId) {
        const sub = await this.prisma.subskrypcja.findUnique({ where: { userId } });
        return sub;
    }
    async createCheckout(userId) {
        const priceId = process.env.STRIPE_PRICE_ID_PRO;
        if (!priceId) {
            throw new common_1.BadRequestException('Brak konfiguracji planu Pro.');
        }
        const user = await this.prisma.uzytkownik.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.BadRequestException('Nie znaleziono użytkownika.');
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
    async createPortal(userId) {
        const sub = await this.prisma.subskrypcja.findUnique({ where: { userId } });
        if (!sub?.stripeCustomerId) {
            throw new common_1.BadRequestException('Brak aktywnego klienta Stripe.');
        }
        const session = await this.stripe.billingPortal.sessions.create({
            customer: sub.stripeCustomerId,
            return_url: `${process.env.APP_URL}/ustawienia/subskrypcja`,
        });
        return { url: session.url };
    }
    async handleWebhook(rawBody, signature) {
        if (!signature) {
            throw new common_1.BadRequestException('Brak podpisu Stripe.');
        }
        const event = this.stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET ?? '');
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                if (session.customer &&
                    session.subscription &&
                    session.customer_email) {
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
                const sub = event.data.object;
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
                const sub = event.data.object;
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
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map