import { IsEnum } from 'class-validator';

export class UpdateUserRoleDto {
  @IsEnum(['ADMIN', 'USER', 'VIEWER'], { message: 'Nieprawidłowa rola.' })
  rola: 'ADMIN' | 'USER' | 'VIEWER';
}


