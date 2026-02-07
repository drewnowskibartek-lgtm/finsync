export declare class CreateTransactionDto {
    data: string;
    kwota: number;
    waluta: string;
    odbiorca: string;
    referencja?: string;
    kategoriaId?: string;
    metoda?: string;
    notatka?: string;
    czyUzgodnione?: boolean;
}
