import { SetMetadata } from '@nestjs/common';

export const FEATURE_KEY = 'feature';

export type Feature =
  | 'RECURRENT'
  | 'CSV_IMPORT'
  | 'EXPORT'
  | 'ADV_REPORTS'
  | 'AUDIT_AUTO'
  | 'CUSTOM_CATEGORIES'
  | 'RECEIPT_OCR';

export const FeatureGate = (feature: Feature) =>
  SetMetadata(FEATURE_KEY, feature);
