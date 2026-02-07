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
exports.PlanGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../prisma/prisma.service");
const plan_limit_decorator_1 = require("../decorators/plan-limit.decorator");
let PlanGuard = class PlanGuard {
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const limit = this.reflector.getAllAndOverride(plan_limit_decorator_1.PLAN_LIMIT_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!limit) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.userId;
        const rola = request.user?.rola;
        if (rola === 'ADMIN') {
            return true;
        }
        if (!userId) {
            return false;
        }
        const sub = await this.prisma.subskrypcja.findUnique({
            where: { userId },
        });
        if (!sub || sub.plan === 'FREE') {
            if (limit === 'TRANSACTIONS_MONTHLY') {
                const start = new Date();
                start.setDate(1);
                start.setHours(0, 0, 0, 0);
                const end = new Date(start);
                end.setMonth(start.getMonth() + 1);
                const count = await this.prisma.transakcja.count({
                    where: {
                        userId,
                        data: { gte: start, lt: end },
                    },
                });
                if (count >= 10) {
                    throw new common_1.ForbiddenException('Limit 10 transakcji miesięcznie w planie Free został przekroczony.');
                }
            }
        }
        return true;
    }
};
exports.PlanGuard = PlanGuard;
exports.PlanGuard = PlanGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], PlanGuard);
//# sourceMappingURL=plan.guard.js.map