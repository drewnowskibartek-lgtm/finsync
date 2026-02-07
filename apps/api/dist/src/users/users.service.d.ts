import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        rola: import(".prisma/client").$Enums.Rola;
        zablokowany: boolean;
        utworzono: Date;
    }>;
}
