import { PrismaService } from '../prisma/prisma.service';
export declare class SubscriptionsService {
    private prisma;
    private stripe;
    constructor(prisma: PrismaService);
    getStatus(userId: string): Promise<{
        id: string;
        utworzono: Date;
        zaktualizowano: Date;
        plan: import(".prisma/client").$Enums.Plan;
        status: import(".prisma/client").$Enums.StatusSubskrypcji;
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
        currentPeriodEnd: Date | null;
        userId: string;
    }>;
    createCheckout(userId: string): Promise<{
        url: string;
    }>;
    createPortal(userId: string): Promise<{
        url: string;
    }>;
    handleWebhook(rawBody: Buffer, signature: string | undefined): Promise<{
        received: boolean;
    }>;
}
