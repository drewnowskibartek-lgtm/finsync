import { PrismaService } from '../prisma/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(userId: string, akcja: string, transakcjaId?: string, notatka?: string): Promise<{
        id: string;
        userId: string;
        notatka: string | null;
        transakcjaId: string | null;
        akcja: string;
        timestamp: Date;
    }>;
    logAutoIfPro(userId: string, akcja: string, transakcjaId?: string): Promise<void>;
    list(userId: string): Promise<{
        id: string;
        userId: string;
        notatka: string | null;
        transakcjaId: string | null;
        akcja: string;
        timestamp: Date;
    }[]>;
}
