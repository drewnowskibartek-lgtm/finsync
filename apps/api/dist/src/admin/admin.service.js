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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listUsers() {
        return this.prisma.uzytkownik.findMany({
            select: {
                id: true,
                email: true,
                rola: true,
                zablokowany: true,
                utworzono: true,
            },
            orderBy: { utworzono: 'desc' },
        });
    }
    async createUser(input) {
        const istnieje = await this.prisma.uzytkownik.findUnique({
            where: { email: input.email },
        });
        if (istnieje) {
            throw new common_1.BadRequestException('Użytkownik o takim e-mailu już istnieje.');
        }
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
        const hasloHash = await bcrypt.hash(input.haslo, saltRounds);
        const status = input.status ?? (input.plan === 'PRO' ? 'AKTYWNA' : 'BRAK');
        return this.prisma.uzytkownik.create({
            data: {
                email: input.email,
                hasloHash,
                rola: input.rola,
                zablokowany: input.zablokowany ?? false,
                subskrypcja: {
                    create: {
                        plan: input.plan,
                        status,
                    },
                },
            },
            select: {
                id: true,
                email: true,
                rola: true,
                zablokowany: true,
                utworzono: true,
            },
        });
    }
    async listSubscriptions() {
        return this.prisma.subskrypcja.findMany({
            include: { uzytkownik: { select: { id: true, email: true } } },
            orderBy: { zaktualizowano: 'desc' },
        });
    }
    async setRole(id, rola) {
        const user = await this.prisma.uzytkownik.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('Nie znaleziono użytkownika.');
        return this.prisma.uzytkownik.update({ where: { id }, data: { rola } });
    }
    async setBlock(id, zablokowany) {
        const user = await this.prisma.uzytkownik.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('Nie znaleziono użytkownika.');
        return this.prisma.uzytkownik.update({
            where: { id },
            data: { zablokowany },
        });
    }
    async createGlobalCategory(nazwa) {
        return this.prisma.kategoria.create({
            data: { nazwa, globalna: true },
        });
    }
    async listGlobalCategories() {
        return this.prisma.kategoria.findMany({
            where: { globalna: true },
            orderBy: { nazwa: 'asc' },
        });
    }
    async deleteGlobalCategory(id) {
        return this.prisma.kategoria.delete({ where: { id } });
    }
    async upsertPlan(plan, stripePriceId) {
        return this.prisma.planKonfiguracja.upsert({
            where: { plan },
            update: { stripePriceId, aktywny: true },
            create: { plan, stripePriceId, aktywny: true },
        });
    }
    async systemLogs(query) {
        return this.prisma.logSystemowy.findMany({
            where: {
                poziom: query?.poziom,
                wiadomosc: query?.zawiera
                    ? { contains: query.zawiera, mode: 'insensitive' }
                    : undefined,
            },
            orderBy: { utworzono: 'desc' },
            take: 200,
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map