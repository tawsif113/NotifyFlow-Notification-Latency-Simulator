export const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`);

export const stripTrailingSlash = (value: string) => value.replace(/\/$/, '');

export const joinUrl = (baseUrl: string, path: string) => {
  const cleanedBase = stripTrailingSlash(baseUrl);
  const cleanedPath = ensureLeadingSlash(path);
  if (/^https?:\/\//i.test(cleanedBase) || /^wss?:\/\//i.test(cleanedBase)) {
    return `${cleanedBase}${cleanedPath}`;
  }
  return `${cleanedBase}${cleanedPath}`;
};

export const resolveTemplate = (template: string, values: Record<string, string>) =>
  Object.entries(values).reduce((acc, [key, value]) => acc.replaceAll(`{${key}}`, value), template);

export const createRandomKey = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const formatIso = (value: string | undefined | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

export const formatLatency = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${value.toFixed(1)} ms`;
};
