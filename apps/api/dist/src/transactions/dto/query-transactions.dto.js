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
exports.QueryTransactionsDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class QueryTransactionsDto {
}
exports.QueryTransactionsDto = QueryTransactionsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_validator_1.IsDateString)({}, { message: 'Nieprawidłowa data od.' }),
    __metadata("design:type", String)
], QueryTransactionsDto.prototype, "od", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_validator_1.IsDateString)({}, { message: 'Nieprawidłowa data do.' }),
    __metadata("design:type", String)
], QueryTransactionsDto.prototype, "do", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_validator_1.IsString)({ message: 'Kategoria musi być tekstem.' }),
    __metadata("design:type", String)
], QueryTransactionsDto.prototype, "kategoriaId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Min kwoty musi być liczbą.' }),
    __metadata("design:type", Number)
], QueryTransactionsDto.prototype, "kwotaMin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Max kwoty musi być liczbą.' }),
    __metadata("design:type", Number)
], QueryTransactionsDto.prototype, "kwotaMax", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_validator_1.IsString)({ message: 'Szukany tekst musi być tekstem.' }),
    __metadata("design:type", String)
], QueryTransactionsDto.prototype, "szukaj", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_validator_1.IsString)({ message: 'Waluta musi być tekstem.' }),
    __metadata("design:type", String)
], QueryTransactionsDto.prototype, "waluta", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_validator_1.IsString)({ message: 'Metoda musi być tekstem.' }),
    __metadata("design:type", String)
], QueryTransactionsDto.prototype, "metoda", void 0);
//# sourceMappingURL=query-transactions.dto.js.map