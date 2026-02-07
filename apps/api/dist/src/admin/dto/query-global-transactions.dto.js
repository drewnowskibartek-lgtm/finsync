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
exports.QueryGlobalTransactionsDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class QueryGlobalTransactionsDto {
}
exports.QueryGlobalTransactionsDto = QueryGlobalTransactionsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_validator_1.IsDateString)({}, { message: 'Nieprawidłowa data od.' }),
    __metadata("design:type", String)
], QueryGlobalTransactionsDto.prototype, "od", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_validator_1.IsDateString)({}, { message: 'Nieprawidłowa data do.' }),
    __metadata("design:type", String)
], QueryGlobalTransactionsDto.prototype, "do", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_validator_1.IsString)({ message: 'UserId musi być tekstem.' }),
    __metadata("design:type", String)
], QueryGlobalTransactionsDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_validator_1.IsString)({ message: 'Kategoria musi być tekstem.' }),
    __metadata("design:type", String)
], QueryGlobalTransactionsDto.prototype, "kategoriaId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Min kwoty musi być liczbą.' }),
    __metadata("design:type", Number)
], QueryGlobalTransactionsDto.prototype, "kwotaMin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Max kwoty musi być liczbą.' }),
    __metadata("design:type", Number)
], QueryGlobalTransactionsDto.prototype, "kwotaMax", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_validator_1.IsString)({ message: 'Szukany tekst musi być tekstem.' }),
    __metadata("design:type", String)
], QueryGlobalTransactionsDto.prototype, "szukaj", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_validator_1.IsString)({ message: 'Waluta musi być tekstem.' }),
    __metadata("design:type", String)
], QueryGlobalTransactionsDto.prototype, "waluta", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' ? undefined : value)),
    (0, class_validator_1.IsString)({ message: 'Metoda musi być tekstem.' }),
    __metadata("design:type", String)
], QueryGlobalTransactionsDto.prototype, "metoda", void 0);
//# sourceMappingURL=query-global-transactions.dto.js.map