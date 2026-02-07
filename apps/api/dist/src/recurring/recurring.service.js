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
exports.RecurringService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let RecurringService = class RecurringService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async list(userId) {
        return this.prisma.recurring.findMany({
            where: { userId },
            orderBy: { nastepnaData: 'asc' },
        });
    }
    async create(userId, dto) {
        return this.prisma.recurring.create({
            data: {
                userId,
                kwota: dto.kwota,
                kategoriaId: dto.kategoriaId,
                odbiorca: dto.odbiorca,
                metoda: dto.metoda,
                notatka: dto.notatka,
                czestotliwosc: dto.czestotliwosc,
                nastepnaData: new Date(dto.nastepnaData),
            },
        });
    }
    async update(userId, id, dto) {
        const existing = await this.prisma.recurring.findFirst({
            where: { id, userId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Nie znaleziono cyklicznej transakcji.');
        }
        const updated = await this.prisma.recurring.update({
            where: { id },
            data: {
                kwota: dto.kwota !== undefined ? dto.kwota : existing.kwota,
                kategoriaId: dto.kategoriaId ?? existing.kategoriaId,
                odbiorca: dto.odbiorca ?? existing.odbiorca,
                metoda: dto.metoda ?? existing.metoda,
                notatka: dto.notatka ?? existing.notatka,
                czestotliwosc: dto.czestotliwosc ?? existing.czestotliwosc,
                nastepnaData: dto.nastepnaData
                    ? new Date(dto.nastepnaData)
                    : existing.nastepnaData,
                aktywna: dto.aktywna ?? existing.aktywna,
            },
        });
        await this.audit.logAutoIfPro(userId, 'Edytowano cykliczną transakcję', id);
        return updated;
    }
    async remove(userId, id) {
        const existing = await this.prisma.recurring.findFirst({
            where: { id, userId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Nie znaleziono cyklicznej transakcji.');
        }
        await this.prisma.recurring.delete({ where: { id } });
        await this.audit.logAutoIfPro(userId, 'Usunięto cykliczną transakcję', id);
        return { ok: true };
    }
    async generujZRecurring() {
        const today = new Date();
        const doWykonania = await this.prisma.recurring.findMany({
            where: { aktywna: true, nastepnaData: { lte: today } },
        });
        for (const r of doWykonania) {
            await this.prisma.transakcja.create({
                data: {
                    userId: r.userId,
                    data: new Date(),
                    kwota: r.kwota,
                    waluta: 'PLN',
                    odbiorca: r.odbiorca,
                    kategoriaId: r.kategoriaId,
                    metoda: r.metoda,
                    notatka: r.notatka,
                    utworzonoPrzez: r.userId,
                },
            });
            await this.audit.logAutoIfPro(r.userId, 'Recurring -> transakcja', r.id);
            const next = new Date(r.nastepnaData);
            switch (r.czestotliwosc) {
                case 'DZIENNA':
                    next.setDate(next.getDate() + 1);
                    break;
                case 'TYGODNIOWA':
                    next.setDate(next.getDate() + 7);
                    break;
                case 'MIESIECZNA':
                    next.setMonth(next.getMonth() + 1);
                    break;
                case 'ROCZNA':
                    next.setFullYear(next.getFullYear() + 1);
                    break;
            }
            await this.prisma.recurring.update({
                where: { id: r.id },
                data: { nastepnaData: next },
            });
        }
    }
};
exports.RecurringService = RecurringService;
__decorate([
    (0, schedule_1.Cron)('0 2 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecurringService.prototype, "generujZRecurring", null);
exports.RecurringService = RecurringService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], RecurringService);
//# sourceMappingURL=recurring.service.js.map