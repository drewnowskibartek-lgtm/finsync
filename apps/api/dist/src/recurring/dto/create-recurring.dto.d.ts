export declare class CreateRecurringDto {
    kwota: number;
    kategoriaId?: string;
    odbiorca: string;
    metoda?: string;
    notatka?: string;
    czestotliwosc: 'DZIENNA' | 'TYGODNIOWA' | 'MIESIECZNA' | 'ROCZNA';
    nastepnaData: string;
}
