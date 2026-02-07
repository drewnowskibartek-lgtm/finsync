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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const reports_service_1 = require("./reports.service");
const feature_decorator_1 = require("../common/decorators/feature.decorator");
const feature_guard_1 = require("../common/guards/feature.guard");
const swagger_2 = require("@nestjs/swagger");
let ReportsController = class ReportsController {
    constructor(reports) {
        this.reports = reports;
    }
    async dashboard(user, od, doDate) {
        return this.reports.dashboard(user.userId, od, doDate);
    }
    async advanced(user, od, doDate) {
        return this.reports.advanced(user.userId, od, doDate);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_2.ApiOperation)({ summary: 'Dashboard użytkownika' }),
    (0, swagger_1.ApiQuery)({ name: 'od', required: false, description: 'Data od (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'do', required: false, description: 'Data do (YYYY-MM-DD)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('od')),
    __param(2, (0, common_1.Query)('do')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('advanced'),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, feature_decorator_1.FeatureGate)('ADV_REPORTS'),
    (0, swagger_2.ApiOperation)({ summary: 'Zaawansowane raporty (Pro)' }),
    (0, swagger_1.ApiQuery)({ name: 'od', required: false, description: 'Data od (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'do', required: false, description: 'Data do (YYYY-MM-DD)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('od')),
    __param(2, (0, common_1.Query)('do')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "advanced", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map