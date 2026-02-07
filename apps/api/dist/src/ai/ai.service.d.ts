import { PrismaService } from '../prisma/prisma.service';
export declare class AiService {
    private prisma;
    constructor(prisma: PrismaService);
    private buildMonthlySummary;
    private sanitizeForHelp;
    private callGemini;
    private callOpenAi;
    private callOpenAiWithImage;
    private checkLimit;
    chat(userId: string, message: string, mode: 'help' | 'analysis' | 'report'): Promise<any>;
    report(userId: string): Promise<any>;
    parseReceipt(userId: string, imageBuffer: Buffer, mime: string): Promise<{
        data?: string;
        kwota?: number;
        waluta?: string;
        odbiorca?: string;
        metoda?: string;
        notatka?: string;
        confidence?: {
            data?: number;
            kwota?: number;
            waluta?: number;
            odbiorca?: number;
            metoda?: number;
            notatka?: number;
        };
    }>;
}
