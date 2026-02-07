"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async register(email, haslo) {
        const istnieje = await this.prisma.uzytkownik.findUnique({
            where: { email },
        });
        if (istnieje) {
            throw new common_1.BadRequestException('Użytkownik o takim e-mailu już istnieje.');
        }
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
        const hasloHash = await bcrypt.hash(haslo, saltRounds);
        const user = await this.prisma.uzytkownik.create({
            data: {
                email,
                hasloHash,
                rola: 'USER',
                subskrypcja: { create: { plan: 'FREE', status: 'BRAK' } },
            },
        });
        return this.signTokens(user.id, user.email, user.rola);
    }
    async login(email, haslo) {
        const user = await this.prisma.uzytkownik.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Nieprawidłowy e-mail lub hasło.');
        }
        if (user.zablokowany) {
            throw new common_1.ForbiddenException('Konto jest zablokowane.');
        }
        const ok = await bcrypt.compare(haslo, user.hasloHash);
        if (!ok) {
            throw new common_1.UnauthorizedException('Nieprawidłowy e-mail lub hasło.');
        }
        return this.signTokens(user.id, user.email, user.rola);
    }
    async signTokens(userId, email, rola) {
        const access = await this.jwt.signAsync({ sub: userId, email, rola }, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: process.env.JWT_ACCESS_EXPIRES ?? '15m',
        });
        const refresh = await this.jwt.signAsync({ sub: userId, email, rola }, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: process.env.JWT_REFRESH_EXPIRES ?? '7d',
        });
        return { accessToken: access, refreshToken: refresh };
    }
    async refresh(userId, email, rola) {
        return this.signTokens(userId, email, rola);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map