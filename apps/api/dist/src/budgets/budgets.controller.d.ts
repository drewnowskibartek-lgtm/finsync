import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
export declare class BudgetsController {
    private budgets;
    constructor(budgets: BudgetsService);
    list(user: {
        userId: string;
    }): Promise<({
        kategoria: {
            id: string;
            utworzono: Date;
            userId: string | null;
            nazwa: string;
            globalna: boolean;
        };
    } & {
        id: string;
        utworzono: Date;
        userId: string;
        rok: number;
        miesiac: number;
        kwota: import("@prisma/client/runtime/library").Decimal;
        roluj: boolean;
        kategoriaId: string;
    })[]>;
    create(user: {
        userId: string;
    }, dto: CreateBudgetDto): Promise<{
        id: string;
        utworzono: Date;
        userId: string;
        rok: number;
        miesiac: number;
        kwota: import("@prisma/client/runtime/library").Decimal;
        roluj: boolean;
        kategoriaId: string;
    }>;
    update(user: {
        userId: string;
    }, id: string, dto: UpdateBudgetDto): Promise<{
        kategoria: {
            id: string;
            utworzono: Date;
            userId: string | null;
            nazwa: string;
            globalna: boolean;
        };
    } & {
        id: string;
        utworzono: Date;
        userId: string;
        rok: number;
        miesiac: number;
        kwota: import("@prisma/client/runtime/library").Decimal;
        roluj: boolean;
        kategoriaId: string;
    }>;
    remove(user: {
        userId: string;
    }, id: string): Promise<{
        ok: boolean;
    }>;
}
