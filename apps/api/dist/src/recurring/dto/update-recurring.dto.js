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
exports.UpdateRecurringDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class UpdateRecurringDto {
}
exports.UpdateRecurringDto = UpdateRecurringDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Kwota musi być liczbą.' }),
    (0, class_validator_1.Min)(0.01, { message: 'Kwota musi być większa od zera.' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateRecurringDto.prototype, "kwota", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Kategoria musi być tekstem.' }),
    __metadata("design:type", String)
], UpdateRecurringDto.prototype, "kategoriaId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Odbiorca musi być tekstem.' }),
    __metadata("design:type", String)
], UpdateRecurringDto.prototype, "odbiorca", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Metoda musi być tekstem.' }),
    __metadata("design:type", String)
], UpdateRecurringDto.prototype, "metoda", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Notatka musi być tekstem.' }),
    __metadata("design:type", String)
], UpdateRecurringDto.prototype, "notatka", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.Czestotliwosc, {
        message: 'Częstotliwość jest nieprawidłowa.',
    }),
    __metadata("design:type", String)
], UpdateRecurringDto.prototype, "czestotliwosc", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Następna data musi być tekstem.' }),
    __metadata("design:type", String)
], UpdateRecurringDto.prototype, "nastepnaData", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Aktywna musi być wartością logiczną.' }),
    __metadata("design:type", Boolean)
], UpdateRecurringDto.prototype, "aktywna", void 0);
//# sourceMappingURL=update-recurring.dto.js.map