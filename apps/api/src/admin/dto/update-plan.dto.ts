import { IsEnum, IsString, MinLength } from 'class-validator';

export class UpdatePlanDto {
  @IsEnum(['FREE', 'PRO'], { message: 'Nieprawidłowy plan.' })
  plan: 'FREE' | 'PRO';

  @IsString({ message: 'Stripe Price ID jest wymagany.' })
  @MinLength(5, { message: 'Stripe Price ID jest zbyt krAltki.' })
  stripePriceId: string;
}


