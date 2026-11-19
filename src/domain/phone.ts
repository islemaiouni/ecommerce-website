export function normalizeAlgerianPhone(input: string): string | null {
  const trimmed = input.trim();
  if (/^\+213\d{9}$/.test(trimmed)) {
    return `0${trimmed.slice(4)}`;
  }
  return /^0[567]\d{8}$/.test(trimmed) ? trimmed : null;
}

export const normalizePhone = normalizeAlgerianPhone;
