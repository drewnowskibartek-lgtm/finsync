import { Request } from 'express';
import { SubscriptionsService } from './subscriptions.service';
export declare class SubscriptionsController {
    private subs;
    constructor(subs: SubscriptionsService);
    status(user: {
        userId: string;
    }): Promise<{
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
    checkout(user: {
        userId: string;
    }): Promise<{
        url: string;
    }>;
    portal(user: {
        userId: string;
    }): Promise<{
        url: string;
    }>;
    webhook(req: Request): Promise<{
        received: boolean;
    }>;
}
