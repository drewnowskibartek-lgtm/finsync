import { IsBoolean, IsOptional } from 'class-validator';

export class CloseSavingsGoalDto {
  @IsOptional()
  @IsBoolean({ message: 'Pole doBudzetu musi być wartością logiczną.' })
  doBudzetu?: boolean;
}
