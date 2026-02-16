import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class SavingsGoalMovementDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'Kwota musi być liczbą.' })
  kwota: number;

  @IsOptional()
  @IsString({ message: 'Notatka musi być tekstem.' })
  @MaxLength(200, { message: 'Notatka może mieć maksymalnie 200 znaków.' })
  notatka?: string;
}
