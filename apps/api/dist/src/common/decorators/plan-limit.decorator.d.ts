export declare const PLAN_LIMIT_KEY = "plan_limit";
export type PlanLimit = 'TRANSACTIONS_MONTHLY';
export declare const PlanLimitGate: (limit: PlanLimit) => import("@nestjs/common").CustomDecorator<string>;
