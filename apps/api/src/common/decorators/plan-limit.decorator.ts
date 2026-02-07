import { SetMetadata } from '@nestjs/common';

export const PLAN_LIMIT_KEY = 'plan_limit';

export type PlanLimit = 'TRANSACTIONS_MONTHLY';

export const PlanLimitGate = (limit: PlanLimit) =>
  SetMetadata(PLAN_LIMIT_KEY, limit);
