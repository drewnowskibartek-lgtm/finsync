import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { FEATURE_KEY, Feature } from '../decorators/feature.decorator';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.getAllAndOverride<Feature>(FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!feature) {
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
      throw new ForbiddenException(
        'Twoja subskrypcja nie obejmuje tej funkcji.',
      );
    }
    return true;
  }
}
