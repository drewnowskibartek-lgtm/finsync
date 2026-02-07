import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PLAN_LIMIT_KEY, PlanLimit } from '../decorators/plan-limit.decorator';

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const limit = this.reflector.getAllAndOverride<PlanLimit>(PLAN_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!limit) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId as string | undefined;
    const rola = request.user?.rola as string | undefined;
    if (rola === 'ADMIN') {
      return true;
    }
    if (!userId) {
      return false;
    }

    const sub = await this.prisma.subskrypcja.findUnique({
      where: { userId },
    });
    if (!sub || sub.plan === 'FREE') {
      if (limit === 'TRANSACTIONS_MONTHLY') {
        const start = new Date();
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setMonth(start.getMonth() + 1);

        const count = await this.prisma.transakcja.count({
          where: {
            userId,
            data: { gte: start, lt: end },
          },
        });
        if (count >= 10) {
          throw new ForbiddenException(
            'Limit 10 transakcji miesięcznie w planie Free został przekroczony.',
          );
        }
      }
    }
    return true;
  }
}


