"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureGate = exports.FEATURE_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.FEATURE_KEY = 'feature';
const FeatureGate = (feature) => (0, common_1.SetMetadata)(exports.FEATURE_KEY, feature);
exports.FeatureGate = FeatureGate;
//# sourceMappingURL=feature.decorator.js.map