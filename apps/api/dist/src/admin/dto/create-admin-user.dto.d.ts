export declare class CreateAdminUserDto {
    email: string;
    haslo: string;
    rola: 'ADMIN' | 'USER' | 'VIEWER';
    plan: 'FREE' | 'PRO';
    status?: 'AKTYWNA' | 'WSTRZYMANA' | 'ANULOWANA' | 'BRAK';
    zablokowany?: boolean;
}
