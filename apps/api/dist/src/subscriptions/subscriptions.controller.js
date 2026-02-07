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
exports.SubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const subscriptions_service_1 = require("./subscriptions.service");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
let SubscriptionsController = class SubscriptionsController {
    constructor(subs) {
        this.subs = subs;
    }
    async status(user) {
        return this.subs.getStatus(user.userId);
    }
    async checkout(user) {
        return this.subs.createCheckout(user.userId);
    }
    async portal(user) {
        return this.subs.createPortal(user.userId);
    }
    async webhook(req) {
        const sig = req.headers['stripe-signature'];
        return this.subs.handleWebhook(req.body, sig);
    }
};
exports.SubscriptionsController = SubscriptionsController;
__decorate([
    (0, common_1.Get)('status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Status subskrypcji' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "status", null);
__decorate([
    (0, common_1.Post)('checkout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'USER'),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Utwórz Stripe Checkout (Pro)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "checkout", null);
__decorate([
    (0, common_1.Post)('portal'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'USER'),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Portal subskrypcji Stripe' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "portal", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'Webhook Stripe' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "webhook", null);
exports.SubscriptionsController = SubscriptionsController = __decorate([
    (0, swagger_1.ApiTags)('subscriptions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('subscriptions'),
    __metadata("design:paramtypes", [subscriptions_service_1.SubscriptionsService])
], SubscriptionsController);
//# sourceMappingURL=subscriptions.controller.js.map