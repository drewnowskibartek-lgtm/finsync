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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const transactions_service_1 = require("./transactions.service");
const create_transaction_dto_1 = require("./dto/create-transaction.dto");
const update_transaction_dto_1 = require("./dto/update-transaction.dto");
const plan_limit_decorator_1 = require("../common/decorators/plan-limit.decorator");
const plan_guard_1 = require("../common/guards/plan.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const feature_decorator_1 = require("../common/decorators/feature.decorator");
const feature_guard_1 = require("../common/guards/feature.guard");
const platform_express_1 = require("@nestjs/platform-express");
const exceljs_1 = require("exceljs");
const query_transactions_dto_1 = require("./dto/query-transactions.dto");
let TransactionsController = class TransactionsController {
    constructor(transactions) {
        this.transactions = transactions;
    }
    async list(user, query) {
        return this.transactions.list(user.userId, query);
    }
    async create(user, dto) {
        return this.transactions.create(user.userId, dto);
    }
    async update(user, id, dto) {
        return this.transactions.update(user.userId, id, dto);
    }
    async remove(user, id) {
        return this.transactions.remove(user.userId, id);
    }
    async importCsv(user, file) {
        if (!file) {
            throw new common_1.BadRequestException('Brak pliku CSV.');
        }
        return this.transactions.importCsv(user.userId, file.buffer.toString('utf-8'));
    }
    async export(user, format = 'csv', res) {
        if (format === 'xlsx') {
            const rows = await this.transactions.exportRows(user.userId);
            const workbook = new exceljs_1.default.Workbook();
            const sheet = workbook.addWorksheet('Transakcje');
            sheet.columns = [
                { header: 'data', key: 'data', width: 12 },
                { header: 'kwota', key: 'kwota', width: 12 },
                { header: 'waluta', key: 'waluta', width: 10 },
                { header: 'odbiorca', key: 'odbiorca', width: 24 },
                { header: 'referencja', key: 'referencja', width: 20 },
                { header: 'kategoria', key: 'kategoria', width: 20 },
                { header: 'metoda', key: 'metoda', width: 14 },
                { header: 'notatka', key: 'notatka', width: 24 },
            ];
            rows.forEach((r) => sheet.addRow(r));
            const buffer = await workbook.xlsx.writeBuffer();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="transakcje.xlsx"');
            return buffer;
        }
        const csv = await this.transactions.exportCsv(user.userId);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="transakcje.csv"');
        return csv;
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiQuery)({
        name: 'od',
        required: false,
        description: 'Data od (YYYY-MM-DD)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'do',
        required: false,
        description: 'Data do (YYYY-MM-DD)',
    }),
    (0, swagger_1.ApiQuery)({ name: 'kategoriaId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'kwotaMin', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'kwotaMax', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'szukaj', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'waluta', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'metoda', required: false }),
    (0, swagger_1.ApiOperation)({ summary: 'Lista transakcji użytkownika' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_transactions_dto_1.QueryTransactionsDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(plan_guard_1.PlanGuard, roles_guard_1.RolesGuard),
    (0, plan_limit_decorator_1.PlanLimitGate)('TRANSACTIONS_MONTHLY'),
    (0, roles_decorator_1.Roles)('ADMIN', 'USER'),
    (0, swagger_1.ApiOperation)({ summary: 'Utwórz transakcję' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_transaction_dto_1.CreateTransactionDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'USER'),
    (0, swagger_1.ApiOperation)({ summary: 'Edytuj transakcję' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_transaction_dto_1.UpdateTransactionDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'USER'),
    (0, swagger_1.ApiOperation)({ summary: 'Usuń transakcję' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard, roles_guard_1.RolesGuard),
    (0, feature_decorator_1.FeatureGate)('CSV_IMPORT'),
    (0, roles_decorator_1.Roles)('ADMIN', 'USER'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Import CSV transakcji (Pro)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "importCsv", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard, roles_guard_1.RolesGuard),
    (0, feature_decorator_1.FeatureGate)('EXPORT'),
    (0, roles_decorator_1.Roles)('ADMIN', 'USER'),
    (0, swagger_1.ApiQuery)({ name: 'format', required: false, enum: ['csv', 'xlsx'] }),
    (0, swagger_1.ApiOperation)({ summary: 'Eksport CSV/XLSX (Pro)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('format')),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "export", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, swagger_1.ApiTags)('transactions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('transactions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map