import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type Rola = 'ADMIN' | 'USER' | 'VIEWER';

export const Roles = (...roles: Rola[]) => SetMetadata(ROLES_KEY, roles);
