import { AuditService } from './audit.service';
export declare class AuditController {
    private audit;
    constructor(audit: AuditService);
    list(user: {
        userId: string;
    }): Promise<{
        id: string;
        userId: string;
        notatka: string | null;
        transakcjaId: string | null;
        akcja: string;
        timestamp: Date;
    }[]>;
}
