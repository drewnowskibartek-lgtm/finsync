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
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const ai_service_1 = require("./ai.service");
const chat_dto_1 = require("./dto/chat.dto");
const feature_decorator_1 = require("../common/decorators/feature.decorator");
const feature_guard_1 = require("../common/guards/feature.guard");
const platform_express_1 = require("@nestjs/platform-express");
let AiController = class AiController {
    constructor(ai) {
        this.ai = ai;
    }
    async chat(user, dto) {
        const reply = await this.ai.chat(user.userId, dto.message, dto.mode);
        return { reply };
    }
    async report(user) {
        const reply = await this.ai.report(user.userId);
        return { reply };
    }
    async parseReceipt(user, file) {
        if (!file) {
            throw new common_1.BadRequestException('Brak pliku obrazu.');
        }
        const data = await this.ai.parseReceipt(user.userId, file.buffer, file.mimetype);
        return { data };
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('chat'),
    (0, swagger_1.ApiOperation)({ summary: 'Asystent AI – czat' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, chat_dto_1.ChatDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "chat", null);
__decorate([
    (0, common_1.Post)('report'),
    (0, swagger_1.ApiOperation)({ summary: 'Asystent AI – raport budżetu' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "report", null);
__decorate([
    (0, common_1.Post)('receipt/parse'),
    (0, swagger_1.ApiOperation)({ summary: 'OCR paragonu/faktury (Pro)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    }),
    (0, common_1.UseGuards)(feature_guard_1.FeatureGuard),
    (0, feature_decorator_1.FeatureGate)('RECEIPT_OCR'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "parseReceipt", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)('ai'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('ai'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map