import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
export declare class BudgetsService {
    private prisma;
    constructor(prisma: PrismaService);
    list(userId: string): Promise<({
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
    create(userId: string, dto: CreateBudgetDto): Promise<{
        id: string;
        utworzono: Date;
        userId: string;
        rok: number;
        miesiac: number;
        kwota: import("@prisma/client/runtime/library").Decimal;
        roluj: boolean;
        kategoriaId: string;
    }>;
    update(userId: string, id: string, dto: UpdateBudgetDto): Promise<{
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
    remove(userId: string, id: string): Promise<{
        ok: boolean;
    }>;
}
