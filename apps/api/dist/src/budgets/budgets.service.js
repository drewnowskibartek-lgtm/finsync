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
exports.BudgetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BudgetsService = class BudgetsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(userId) {
        return this.prisma.budzet.findMany({
            where: { userId },
            include: { kategoria: true },
            orderBy: [{ rok: 'desc' }, { miesiac: 'desc' }],
        });
    }
    async create(userId, dto) {
        return this.prisma.budzet.create({
            data: {
                userId,
                kategoriaId: dto.kategoriaId,
                rok: dto.rok,
                miesiac: dto.miesiac,
                kwota: dto.kwota,
                roluj: dto.roluj ?? false,
            },
        });
    }
    async update(userId, id, dto) {
        const budget = await this.prisma.budzet.findFirst({
            where: { id, userId },
        });
        if (!budget) {
            throw new common_1.NotFoundException('Nie znaleziono budżetu.');
        }
        return this.prisma.budzet.update({
            where: { id },
            data: {
                kategoriaId: dto.kategoriaId ?? budget.kategoriaId,
                rok: dto.rok ?? budget.rok,
                miesiac: dto.miesiac ?? budget.miesiac,
                kwota: dto.kwota !== undefined ? dto.kwota : budget.kwota,
                roluj: dto.roluj !== undefined ? dto.roluj : budget.roluj,
            },
            include: { kategoria: true },
        });
    }
    async remove(userId, id) {
        const budget = await this.prisma.budzet.findFirst({
            where: { id, userId },
        });
        if (!budget) {
            throw new common_1.NotFoundException('Nie znaleziono budżetu.');
        }
        await this.prisma.budzet.delete({ where: { id } });
        return { ok: true };
    }
};
exports.BudgetsService = BudgetsService;
exports.BudgetsService = BudgetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BudgetsService);
//# sourceMappingURL=budgets.service.js.map