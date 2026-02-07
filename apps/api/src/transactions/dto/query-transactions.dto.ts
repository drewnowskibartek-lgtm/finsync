import { Transform, Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryTransactionsDto {
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString({}, { message: 'Nieprawidłowa data od.' })
  od?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString({}, { message: 'Nieprawidłowa data do.' })
  do?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString({ message: 'Kategoria musi być tekstem.' })
  kategoriaId?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @Type(() => Number)
  @IsNumber({}, { message: 'Min kwoty musi być liczbą.' })
  kwotaMin?: number;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @Type(() => Number)
  @IsNumber({}, { message: 'Max kwoty musi być liczbą.' })
  kwotaMax?: number;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString({ message: 'Szukany tekst musi być tekstem.' })
  szukaj?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString({ message: 'Waluta musi być tekstem.' })
  waluta?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString({ message: 'Metoda musi być tekstem.' })
  metoda?: string;
}


