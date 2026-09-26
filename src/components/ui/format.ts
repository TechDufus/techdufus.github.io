/* Shared helpers for the UI components (ported from design/pro-studio/shared.js Pro.*). */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export type DateStyle = 'long' | 'short' | 'day' | 'year';

/** ISO `YYYY-MM-DD` (UTC) for a Date or ISO string; '' when missing. */
export function isoDate(value: Date | string | null | undefined): string {
  if (!value) return '';
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? '' : value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

/** 'long' "Mar 3, 2026" | 'short' "Mar 2026" | 'day' "Mar 3" | 'year' "2026" (UTC, like the mockup). */
export function fmtDate(value: Date | string | null | undefined, style: DateStyle = 'long'): string {
  const iso = isoDate(value);
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const mon = MONTHS[(m || 1) - 1];
  switch (style) {
    case 'short':
      return `${mon} ${y}`;
    case 'day':
      return `${mon} ${d}`;
    case 'year':
      return String(y);
    default:
      return `${mon} ${d}, ${y}`;
  }
}

export const isExternal = (href: string | undefined | null): boolean => /^https?:\/\//.test(href ?? '');

/** target/rel for external links, spread onto an <a>. */
export const linkProps = (href: string) =>
  isExternal(href) ? { href, target: '_blank', rel: 'noopener' } : { href };

/** Tags without the noise tag "blog", capped to n. */
export const visibleTags = (tags: readonly string[] | undefined, n?: number): string[] =>
  (tags ?? []).filter((t) => t !== 'blog').slice(0, n ?? 99);

export const fmtNum = (n: number): string => n.toLocaleString('en-US');

/** `--d:N` reveal stagger step, or undefined. */
export const delay = (d: number | undefined | null): string | undefined => (d == null ? undefined : `--d:${d}`);

export const pad2 = (n: number | string): string => String(n).padStart(2, '0');

/** Hostname without `www.`, for source labels. */
export const hostOf = (href: string): string => {
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};
