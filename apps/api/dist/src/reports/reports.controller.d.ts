import { ReportsService } from './reports.service';
export declare class ReportsController {
    private reports;
    constructor(reports: ReportsService);
    dashboard(user: {
        userId: string;
    }, od?: string, doDate?: string): Promise<{
        przychody: number;
        wydatki: number;
        saldo: number;
        wskOszczednosci: number;
        budzetLacznie: number;
        top5: {
            nazwa: string;
            suma: number;
        }[];
        trend: any[];
    }>;
    advanced(user: {
        userId: string;
    }, od?: string, doDate?: string): Promise<{
        kategorie: {
            suma: number;
            kategoriaId: string;
            nazwa: string;
        }[];
        budzety: {
            id: string;
            kategoria: string;
            kwota: number;
            wydano: number;
            procent: number;
            carryOver: number;
            available: number;
            remaining: number;
        }[];
    }>;
}
