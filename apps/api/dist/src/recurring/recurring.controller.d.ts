import { CreateRecurringDto } from './dto/create-recurring.dto';
import { UpdateRecurringDto } from './dto/update-recurring.dto';
import { RecurringService } from './recurring.service';
export declare class RecurringController {
    private recurring;
    constructor(recurring: RecurringService);
    list(user: {
        userId: string;
    }): Promise<{
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
    create(user: {
        userId: string;
    }, dto: CreateRecurringDto): Promise<{
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
    update(user: {
        userId: string;
    }, id: string, dto: UpdateRecurringDto): Promise<{
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
    remove(user: {
        userId: string;
    }, id: string): Promise<{
        ok: boolean;
    }>;
}
