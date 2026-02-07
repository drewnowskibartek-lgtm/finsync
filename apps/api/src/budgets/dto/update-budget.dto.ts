import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateBudgetDto {
  @IsOptional()
  @IsString({ message: 'Kategoria musi być tekstem.' })
  kategoriaId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Rok musi być liczbą całkowitą.' })
  rok?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Miesiąc musi być liczbą całkowitą.' })
  @Min(1, { message: 'Miesiąc musi być z zakresu 1-12.' })
  @Max(12, { message: 'Miesiąc musi być z zakresu 1-12.' })
  miesiac?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Kwota musi być liczbą.' })
  @Min(0.01, { message: 'Kwota musi być większa od zera.' })
  kwota?: number;

  @IsOptional()
  @IsBoolean({ message: 'Roluj musi być wartością logiczną.' })
  roluj?: boolean;
}
