import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    listUsers(): Promise<{
        id: string;
        email: string;
        rola: import(".prisma/client").$Enums.Rola;
        zablokowany: boolean;
        utworzono: Date;
    }[]>;
    createUser(input: {
        email: string;
        haslo: string;
        rola: 'ADMIN' | 'USER' | 'VIEWER';
        plan: 'FREE' | 'PRO';
        status?: 'AKTYWNA' | 'WSTRZYMANA' | 'ANULOWANA' | 'BRAK';
        zablokowany?: boolean;
    }): Promise<{
        id: string;
        email: string;
        rola: import(".prisma/client").$Enums.Rola;
        zablokowany: boolean;
        utworzono: Date;
    }>;
    listSubscriptions(): Promise<({
        uzytkownik: {
            id: string;
            email: string;
        };
    } & {
        id: string;
        utworzono: Date;
        zaktualizowano: Date;
        plan: import(".prisma/client").$Enums.Plan;
        status: import(".prisma/client").$Enums.StatusSubskrypcji;
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
        currentPeriodEnd: Date | null;
        userId: string;
    })[]>;
    setRole(id: string, rola: 'ADMIN' | 'USER' | 'VIEWER'): Promise<{
        id: string;
        email: string;
        hasloHash: string;
        rola: import(".prisma/client").$Enums.Rola;
        zablokowany: boolean;
        utworzono: Date;
        zaktualizowano: Date;
    }>;
    setBlock(id: string, zablokowany: boolean): Promise<{
        id: string;
        email: string;
        hasloHash: string;
        rola: import(".prisma/client").$Enums.Rola;
        zablokowany: boolean;
        utworzono: Date;
        zaktualizowano: Date;
    }>;
    createGlobalCategory(nazwa: string): Promise<{
        id: string;
        utworzono: Date;
        userId: string | null;
        nazwa: string;
        globalna: boolean;
    }>;
    listGlobalCategories(): Promise<{
        id: string;
        utworzono: Date;
        userId: string | null;
        nazwa: string;
        globalna: boolean;
    }[]>;
    deleteGlobalCategory(id: string): Promise<{
        id: string;
        utworzono: Date;
        userId: string | null;
        nazwa: string;
        globalna: boolean;
    }>;
    upsertPlan(plan: 'FREE' | 'PRO', stripePriceId: string): Promise<{
        id: string;
        utworzono: Date;
        plan: import(".prisma/client").$Enums.Plan;
        stripePriceId: string;
        aktywny: boolean;
    }>;
    systemLogs(query?: {
        poziom?: string;
        zawiera?: string;
    }): Promise<{
        id: string;
        utworzono: Date;
        poziom: string;
        wiadomosc: string;
    }[]>;
}
