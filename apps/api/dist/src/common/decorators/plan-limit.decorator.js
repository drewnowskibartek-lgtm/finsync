"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanLimitGate = exports.PLAN_LIMIT_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PLAN_LIMIT_KEY = 'plan_limit';
const PlanLimitGate = (limit) => (0, common_1.SetMetadata)(exports.PLAN_LIMIT_KEY, limit);
exports.PlanLimitGate = PlanLimitGate;
//# sourceMappingURL=plan-limit.decorator.js.map