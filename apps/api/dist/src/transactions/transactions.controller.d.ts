import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Response } from 'express';
import ExcelJS from 'exceljs';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
export declare class TransactionsController {
    private transactions;
    constructor(transactions: TransactionsService);
    list(user: {
        userId: string;
    }, query: QueryTransactionsDto): Promise<({
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
        zaktualizowano: Date;
        userId: string;
        data: Date;
        kwota: import("@prisma/client/runtime/library").Decimal;
        kategoriaId: string | null;
        odbiorca: string;
        metoda: string | null;
        notatka: string | null;
        czyUzgodnione: boolean;
        referencja: string | null;
        waluta: string;
        utworzonoPrzez: string;
        flagaDuplikatu: boolean;
    })[]>;
    create(user: {
        userId: string;
    }, dto: CreateTransactionDto): Promise<{
        id: string;
        utworzono: Date;
        zaktualizowano: Date;
        userId: string;
        data: Date;
        kwota: import("@prisma/client/runtime/library").Decimal;
        kategoriaId: string | null;
        odbiorca: string;
        metoda: string | null;
        notatka: string | null;
        czyUzgodnione: boolean;
        referencja: string | null;
        waluta: string;
        utworzonoPrzez: string;
        flagaDuplikatu: boolean;
    }>;
    update(user: {
        userId: string;
    }, id: string, dto: UpdateTransactionDto): Promise<{
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
        zaktualizowano: Date;
        userId: string;
        data: Date;
        kwota: import("@prisma/client/runtime/library").Decimal;
        kategoriaId: string | null;
        odbiorca: string;
        metoda: string | null;
        notatka: string | null;
        czyUzgodnione: boolean;
        referencja: string | null;
        waluta: string;
        utworzonoPrzez: string;
        flagaDuplikatu: boolean;
    }>;
    remove(user: {
        userId: string;
    }, id: string): Promise<{
        ok: boolean;
    }>;
    importCsv(user: {
        userId: string;
    }, file?: Express.Multer.File): Promise<{
        dodane: number;
        duplikaty: number;
        bledy: {
            wiersz: number;
            blad: string;
        }[];
    }>;
    export(user: {
        userId: string;
    }, format: 'csv' | 'xlsx', res: Response): Promise<string | ExcelJS.Buffer>;
}
