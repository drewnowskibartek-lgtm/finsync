import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUser {
  userId: string;
  email: string;
  rola: 'ADMIN' | 'USER' | 'VIEWER';
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): CurrentUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as CurrentUser;
  },
);
