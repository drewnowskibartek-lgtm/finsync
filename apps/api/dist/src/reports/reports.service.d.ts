import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    private buildRange;
    private getMonthRange;
    dashboard(userId: string, od?: string, doDate?: string): Promise<{
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
    advanced(userId: string, od?: string, doDate?: string): Promise<{
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
