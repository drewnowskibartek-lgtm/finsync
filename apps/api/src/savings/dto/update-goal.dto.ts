import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateSavingsGoalDto {
  @IsOptional()
  @IsString({ message: 'Nazwa musi być tekstem.' })
  @MinLength(2, { message: 'Nazwa musi mieć co najmniej 2 znaki.' })
  @MaxLength(80, { message: 'Nazwa może mieć maksymalnie 80 znaków.' })
  nazwa?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Kwota docelowa musi być liczbą.' })
  kwotaDocelowa?: number;
}
