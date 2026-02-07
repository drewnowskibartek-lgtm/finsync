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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const admin_service_1 = require("./admin.service");
const update_user_role_dto_1 = require("./dto/update-user-role.dto");
const create_global_category_dto_1 = require("./dto/create-global-category.dto");
const update_plan_dto_1 = require("./dto/update-plan.dto");
const query_logs_dto_1 = require("./dto/query-logs.dto");
const create_admin_user_dto_1 = require("./dto/create-admin-user.dto");
let AdminController = class AdminController {
    constructor(admin) {
        this.admin = admin;
    }
    async listUsers() {
        return this.admin.listUsers();
    }
    async createUser(dto) {
        return this.admin.createUser(dto);
    }
    async setRole(id, dto) {
        return this.admin.setRole(id, dto.rola);
    }
    async block(id) {
        return this.admin.setBlock(id, true);
    }
    async unblock(id) {
        return this.admin.setBlock(id, false);
    }
    async listGlobalCategories() {
        return this.admin.listGlobalCategories();
    }
    async createGlobalCategory(body) {
        return this.admin.createGlobalCategory(body.nazwa);
    }
    async deleteGlobalCategory(id) {
        return this.admin.deleteGlobalCategory(id);
    }
    async upsertPlan(body) {
        return this.admin.upsertPlan(body.plan, body.stripePriceId);
    }
    async logs(query) {
        return this.admin.systemLogs(query);
    }
    async listSubscriptions() {
        return this.admin.listSubscriptions();
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Lista użytkowników (admin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Post)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Utwórz użytkownika (admin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_admin_user_dto_1.CreateAdminUserDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createUser", null);
__decorate([
    (0, common_1.Patch)('users/:id/role'),
    (0, swagger_1.ApiOperation)({ summary: 'Zmiana roli użytkownika' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_role_dto_1.UpdateUserRoleDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "setRole", null);
__decorate([
    (0, common_1.Patch)('users/:id/block'),
    (0, swagger_1.ApiOperation)({ summary: 'Blokada użytkownika' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "block", null);
__decorate([
    (0, common_1.Patch)('users/:id/unblock'),
    (0, swagger_1.ApiOperation)({ summary: 'Odblokowanie użytkownika' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "unblock", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Lista kategorii globalnych' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listGlobalCategories", null);
__decorate([
    (0, common_1.Post)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Dodaj kategorię globalną' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_global_category_dto_1.CreateGlobalCategoryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createGlobalCategory", null);
__decorate([
    (0, common_1.Post)('categories/:id/delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Usuń kategorię globalną' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteGlobalCategory", null);
__decorate([
    (0, common_1.Post)('plans'),
    (0, swagger_1.ApiOperation)({ summary: 'Mapowanie planu do Stripe Price ID' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_plan_dto_1.UpdatePlanDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "upsertPlan", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Logi systemowe' }),
    (0, swagger_1.ApiQuery)({ name: 'poziom', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'zawiera', required: false }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_logs_dto_1.QueryLogsDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "logs", null);
__decorate([
    (0, common_1.Get)('subscriptions'),
    (0, swagger_1.ApiOperation)({ summary: 'Lista subskrypcji' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listSubscriptions", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map