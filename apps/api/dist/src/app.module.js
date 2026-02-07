"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const transactions_module_1 = require("./transactions/transactions.module");
const categories_module_1 = require("./categories/categories.module");
const budgets_module_1 = require("./budgets/budgets.module");
const recurring_module_1 = require("./recurring/recurring.module");
const audit_module_1 = require("./audit/audit.module");
const subscriptions_module_1 = require("./subscriptions/subscriptions.module");
const reports_module_1 = require("./reports/reports.module");
const admin_module_1 = require("./admin/admin.module");
const health_module_1 = require("./health/health.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const ai_module_1 = require("./ai/ai.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot({
                throttlers: [
                    {
                        ttl: Number(process.env.RATE_LIMIT_TTL ?? 60),
                        limit: Number(process.env.RATE_LIMIT_LIMIT ?? 30),
                    },
                ],
            }),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            transactions_module_1.TransactionsModule,
            categories_module_1.CategoriesModule,
            budgets_module_1.BudgetsModule,
            recurring_module_1.RecurringModule,
            audit_module_1.AuditModule,
            subscriptions_module_1.SubscriptionsModule,
            reports_module_1.ReportsModule,
            admin_module_1.AdminModule,
            ai_module_1.AiModule,
            health_module_1.HealthModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: http_exception_filter_1.HttpExceptionFilter,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map