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
exports.UpdateTransactionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class UpdateTransactionDto {
}
exports.UpdateTransactionDto = UpdateTransactionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Podaj poprawną datę.' }),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "data", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Kwota musi być liczbą.' }),
    __metadata("design:type", Number)
], UpdateTransactionDto.prototype, "kwota", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Waluta musi być tekstem.' }),
    (0, class_validator_1.MinLength)(3, { message: 'Waluta musi mieć 3 znaki.' }),
    (0, class_validator_1.MaxLength)(3, { message: 'Waluta musi mieć 3 znaki.' }),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "waluta", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Odbiorca musi być tekstem.' }),
    (0, class_validator_1.MinLength)(2, { message: 'Odbiorca musi mieć co najmniej 2 znaki.' }),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "odbiorca", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Referencja musi być tekstem.' }),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "referencja", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Kategoria musi być tekstem.' }),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "kategoriaId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Metoda musi być tekstem.' }),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "metoda", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Notatka musi być tekstem.' }),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "notatka", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Czy uzgodnione musi być wartością logiczną.' }),
    __metadata("design:type", Boolean)
], UpdateTransactionDto.prototype, "czyUzgodnione", void 0);
//# sourceMappingURL=update-transaction.dto.js.map