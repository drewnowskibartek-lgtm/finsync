const isStandaloneMode = () => {
  if (typeof window === 'undefined') return false;
  const mediaMatch =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean })
    .standalone;
  return Boolean(mediaMatch || iosStandalone);
};

export const getAuthStorage = () => {
  if (typeof window === 'undefined') return null;
  return isStandaloneMode() ? window.sessionStorage : window.localStorage;
};
