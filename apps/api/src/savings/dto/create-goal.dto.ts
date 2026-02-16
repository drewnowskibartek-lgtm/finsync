import { Type } from 'class-transformer';
import { IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSavingsGoalDto {
  @IsString({ message: 'Nazwa jest wymagana.' })
  @MinLength(2, { message: 'Nazwa musi mieć co najmniej 2 znaki.' })
  @MaxLength(80, { message: 'Nazwa może mieć maksymalnie 80 znaków.' })
  nazwa: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Kwota docelowa musi być liczbą.' })
  kwotaDocelowa: number;
}
