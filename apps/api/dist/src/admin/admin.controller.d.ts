import { AdminService } from './admin.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { CreateGlobalCategoryDto } from './dto/create-global-category.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { QueryLogsDto } from './dto/query-logs.dto';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
export declare class AdminController {
    private admin;
    constructor(admin: AdminService);
    listUsers(): Promise<{
        id: string;
        email: string;
        rola: import(".prisma/client").$Enums.Rola;
        zablokowany: boolean;
        utworzono: Date;
    }[]>;
    createUser(dto: CreateAdminUserDto): Promise<{
        id: string;
        email: string;
        rola: import(".prisma/client").$Enums.Rola;
        zablokowany: boolean;
        utworzono: Date;
    }>;
    setRole(id: string, dto: UpdateUserRoleDto): Promise<{
        id: string;
        email: string;
        hasloHash: string;
        rola: import(".prisma/client").$Enums.Rola;
        zablokowany: boolean;
        utworzono: Date;
        zaktualizowano: Date;
    }>;
    block(id: string): Promise<{
        id: string;
        email: string;
        hasloHash: string;
        rola: import(".prisma/client").$Enums.Rola;
        zablokowany: boolean;
        utworzono: Date;
        zaktualizowano: Date;
    }>;
    unblock(id: string): Promise<{
        id: string;
        email: string;
        hasloHash: string;
        rola: import(".prisma/client").$Enums.Rola;
        zablokowany: boolean;
        utworzono: Date;
        zaktualizowano: Date;
    }>;
    listGlobalCategories(): Promise<{
        id: string;
        utworzono: Date;
        userId: string | null;
        nazwa: string;
        globalna: boolean;
    }[]>;
    createGlobalCategory(body: CreateGlobalCategoryDto): Promise<{
        id: string;
        utworzono: Date;
        userId: string | null;
        nazwa: string;
        globalna: boolean;
    }>;
    deleteGlobalCategory(id: string): Promise<{
        id: string;
        utworzono: Date;
        userId: string | null;
        nazwa: string;
        globalna: boolean;
    }>;
    upsertPlan(body: UpdatePlanDto): Promise<{
        id: string;
        utworzono: Date;
        plan: import(".prisma/client").$Enums.Plan;
        stripePriceId: string;
        aktywny: boolean;
    }>;
    logs(query: QueryLogsDto): Promise<{
        id: string;
        utworzono: Date;
        poziom: string;
        wiadomosc: string;
    }[]>;
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
}
