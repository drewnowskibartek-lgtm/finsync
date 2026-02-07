export declare const ROLES_KEY = "roles";
export type Rola = 'ADMIN' | 'USER' | 'VIEWER';
export declare const Roles: (...roles: Rola[]) => import("@nestjs/common").CustomDecorator<string>;
