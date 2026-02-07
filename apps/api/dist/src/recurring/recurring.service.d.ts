import { PrismaService } from '../prisma/prisma.service';
import { CreateRecurringDto } from './dto/create-recurring.dto';
import { UpdateRecurringDto } from './dto/update-recurring.dto';
import { AuditService } from '../audit/audit.service';
export declare class RecurringService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditService);
    list(userId: string): Promise<{
        id: string;
        userId: string;
        kwota: import("@prisma/client/runtime/library").Decimal;
        kategoriaId: string | null;
        odbiorca: string;
        metoda: string | null;
        notatka: string | null;
        czestotliwosc: import(".prisma/client").$Enums.Czestotliwosc;
        nastepnaData: Date;
        aktywna: boolean;
        utworzono: Date;
    }[]>;
    create(userId: string, dto: CreateRecurringDto): Promise<{
        id: string;
        userId: string;
        kwota: import("@prisma/client/runtime/library").Decimal;
        kategoriaId: string | null;
        odbiorca: string;
        metoda: string | null;
        notatka: string | null;
        czestotliwosc: import(".prisma/client").$Enums.Czestotliwosc;
        nastepnaData: Date;
        aktywna: boolean;
        utworzono: Date;
    }>;
    update(userId: string, id: string, dto: UpdateRecurringDto): Promise<{
        id: string;
        userId: string;
        kwota: import("@prisma/client/runtime/library").Decimal;
        kategoriaId: string | null;
        odbiorca: string;
        metoda: string | null;
        notatka: string | null;
        czestotliwosc: import(".prisma/client").$Enums.Czestotliwosc;
        nastepnaData: Date;
        aktywna: boolean;
        utworzono: Date;
    }>;
    remove(userId: string, id: string): Promise<{
        ok: boolean;
    }>;
    generujZRecurring(): Promise<void>;
}
