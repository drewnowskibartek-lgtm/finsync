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
exports.UpdateBudgetDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class UpdateBudgetDto {
}
exports.UpdateBudgetDto = UpdateBudgetDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Kategoria musi być tekstem.' }),
    __metadata("design:type", String)
], UpdateBudgetDto.prototype, "kategoriaId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Rok musi być liczbą całkowitą.' }),
    __metadata("design:type", Number)
], UpdateBudgetDto.prototype, "rok", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Miesiąc musi być liczbą całkowitą.' }),
    (0, class_validator_1.Min)(1, { message: 'Miesiąc musi być z zakresu 1-12.' }),
    (0, class_validator_1.Max)(12, { message: 'Miesiąc musi być z zakresu 1-12.' }),
    __metadata("design:type", Number)
], UpdateBudgetDto.prototype, "miesiac", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Kwota musi być liczbą.' }),
    (0, class_validator_1.Min)(0.01, { message: 'Kwota musi być większa od zera.' }),
    __metadata("design:type", Number)
], UpdateBudgetDto.prototype, "kwota", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Roluj musi być wartością logiczną.' }),
    __metadata("design:type", Boolean)
], UpdateBudgetDto.prototype, "roluj", void 0);
//# sourceMappingURL=update-budget.dto.js.map