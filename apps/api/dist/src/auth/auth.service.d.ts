import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    register(email: string, haslo: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    login(email: string, haslo: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    signTokens(userId: string, email: string, rola: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(userId: string, email: string, rola: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
