export declare const FEATURE_KEY = "feature";
export type Feature = 'RECURRENT' | 'CSV_IMPORT' | 'EXPORT' | 'ADV_REPORTS' | 'AUDIT_AUTO' | 'CUSTOM_CATEGORIES' | 'RECEIPT_OCR';
export declare const FeatureGate: (feature: Feature) => import("@nestjs/common").CustomDecorator<string>;
