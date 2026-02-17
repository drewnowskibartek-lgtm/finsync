const amountFormatter = new Intl.NumberFormat('pl-PL', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatAmount = (value: number): string => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return amountFormatter.format(0);
  }
  return amountFormatter.format(numeric);
};

export const formatPercent = (value: number, digits = 1): string => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return (0).toFixed(digits);
  }
  return numeric.toFixed(digits);
};
