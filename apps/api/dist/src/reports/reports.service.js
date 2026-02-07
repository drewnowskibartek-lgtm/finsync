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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    buildRange(od, doDate) {
        if (od || doDate) {
            if (!od || !doDate) {
                throw new common_1.BadRequestException('Podaj oba parametry: od i do.');
            }
            const start = new Date(od);
            const end = new Date(doDate);
            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                throw new common_1.BadRequestException('Nieprawidłowy zakres dat.');
            }
            if (start > end) {
                throw new common_1.BadRequestException('Data od nie może być po dacie do.');
            }
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            return { start, end, inclusive: true };
        }
        const start = new Date();
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setMonth(start.getMonth() + 1);
        return { start, end, inclusive: false };
    }
    getMonthRange(date) {
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
    }
    async dashboard(userId, od, doDate) {
        const range = this.buildRange(od, doDate);
        const transactions = await this.prisma.transakcja.findMany({
            where: {
                userId,
                data: range.inclusive
                    ? { gte: range.start, lte: range.end }
                    : { gte: range.start, lt: range.end },
            },
            include: { kategoria: true },
        });
        const przychody = transactions
            .filter((t) => Number(t.kwota) > 0)
            .reduce((s, t) => s + Number(t.kwota), 0);
        const wydatki = transactions
            .filter((t) => Number(t.kwota) < 0)
            .reduce((s, t) => s + Math.abs(Number(t.kwota)), 0);
        const saldo = przychody - wydatki;
        const wskOszczednosci = przychody > 0 ? (saldo / przychody) * 100 : 0;
        const allTime = await this.prisma.transakcja.aggregate({
            where: { userId },
            _sum: { kwota: true },
        });
        const budzetLacznie = Number(allTime._sum.kwota ?? 0);
        const topMap = new Map();
        for (const t of transactions) {
            const nazwa = t.kategoria?.nazwa ?? 'Bez kategorii';
            if (Number(t.kwota) < 0 && nazwa.toLowerCase() !== 'wynagrodzenie') {
                topMap.set(nazwa, (topMap.get(nazwa) ?? 0) + Math.abs(Number(t.kwota)));
            }
        }
        const top5 = Array.from(topMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([nazwa, suma]) => ({ nazwa, suma }));
        const trend = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const s = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const e = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            const sum = await this.prisma.transakcja.aggregate({
                where: { userId, data: { gte: s, lt: e } },
                _sum: { kwota: true },
            });
            trend.push({
                miesiac: `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, '0')}`,
                suma: Number(sum._sum.kwota ?? 0),
            });
        }
        return {
            przychody,
            wydatki,
            saldo,
            wskOszczednosci,
            budzetLacznie,
            top5,
            trend,
        };
    }
    async advanced(userId, od, doDate) {
        const range = this.buildRange(od, doDate);
        const grouped = await this.prisma.transakcja.groupBy({
            by: ['kategoriaId'],
            where: {
                userId,
                data: range.inclusive
                    ? { gte: range.start, lte: range.end }
                    : { gte: range.start, lt: range.end },
            },
            _sum: { kwota: true },
        });
        const categories = await this.prisma.kategoria.findMany({
            where: { OR: [{ globalna: true }, { userId }] },
        });
        const catMap = new Map(categories.map((c) => [c.id, c.nazwa]));
        const kategorie = grouped
            .map((g) => ({
            kategoriaId: g.kategoriaId,
            nazwa: g.kategoriaId
                ? (catMap.get(g.kategoriaId) ?? 'Nieznana')
                : 'Bez kategorii',
            suma: Number(g._sum.kwota ?? 0),
        }))
            .filter((k) => k.suma < 0)
            .map((k) => ({ ...k, suma: Math.abs(k.suma) }));
        const budgets = await this.prisma.budzet.findMany({
            where: {
                userId,
                rok: range.start.getFullYear(),
                miesiac: range.start.getMonth() + 1,
            },
            include: { kategoria: true },
        });
        const wydanoMap = new Map();
        for (const g of grouped) {
            if (g.kategoriaId) {
                const val = Number(g._sum.kwota ?? 0);
                if (val < 0) {
                    wydanoMap.set(g.kategoriaId, Math.abs(val));
                }
            }
        }
        const prevMonth = new Date(range.start.getFullYear(), range.start.getMonth() - 1, 1);
        const prevRange = this.getMonthRange(prevMonth);
        const prevGrouped = await this.prisma.transakcja.groupBy({
            by: ['kategoriaId'],
            where: {
                userId,
                data: { gte: prevRange.start, lte: prevRange.end },
            },
            _sum: { kwota: true },
        });
        const prevSpentMap = new Map();
        for (const g of prevGrouped) {
            if (g.kategoriaId) {
                const val = Number(g._sum.kwota ?? 0);
                if (val < 0) {
                    prevSpentMap.set(g.kategoriaId, Math.abs(val));
                }
            }
        }
        const prevBudgets = await this.prisma.budzet.findMany({
            where: {
                userId,
                rok: prevMonth.getFullYear(),
                miesiac: prevMonth.getMonth() + 1,
            },
            include: { kategoria: true },
        });
        const prevBudgetMap = new Map();
        for (const b of prevBudgets) {
            if (b.roluj) {
                prevBudgetMap.set(b.kategoriaId, Number(b.kwota));
            }
        }
        const budzety = budgets.map((b) => {
            const wydano = wydanoMap.get(b.kategoriaId) ?? 0;
            const limit = Number(b.kwota);
            const rollover = !!b.roluj;
            let carryOver = 0;
            if (rollover) {
                const prevLimit = prevBudgetMap.get(b.kategoriaId) ?? 0;
                const prevSpent = prevSpentMap.get(b.kategoriaId) ?? 0;
                carryOver = Math.max(0, prevLimit - prevSpent);
            }
            const available = limit + carryOver;
            const remaining = Math.max(0, available - wydano);
            const procent = available > 0 ? Math.round((wydano / available) * 100) : 0;
            return {
                id: b.id,
                kategoria: b.kategoria.nazwa,
                kwota: limit,
                wydano,
                procent,
                carryOver,
                available,
                remaining,
            };
        });
        return {
            kategorie,
            budzety,
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map