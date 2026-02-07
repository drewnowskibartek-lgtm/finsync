import { Czestotliwosc } from '@prisma/client';
export declare class UpdateRecurringDto {
    kwota?: number;
    kategoriaId?: string;
    odbiorca?: string;
    metoda?: string;
    notatka?: string;
    czestotliwosc?: Czestotliwosc;
    nastepnaData?: string;
    aktywna?: boolean;
}
