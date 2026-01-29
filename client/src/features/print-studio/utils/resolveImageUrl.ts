/**
 * resolveImageUrl – Ensures all image URLs are absolute before they reach the UI or PDF renderer.
 *
 * Rules:
 *  1. Already absolute (http/https) → pass through
 *  2. Data URI (data:) or blob URL (blob:) → pass through
 *  3. Relative path (starts with `/`) → prepend API base
 *  4. Empty / falsy → return empty string
 */
export function resolveImageUrl(url: string | undefined | null): string {
  if (!url) return '';

  // Already absolute or a data/blob URI – pass through
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }

  // Relative path – prepend the API base URL
  // Vite exposes env vars via import.meta.env; fall back to a sensible default.
  const apiBase: string =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
    'http://localhost:3000';

  // Ensure no double-slash when url already starts with `/`
  const separator = url.startsWith('/') ? '' : '/';
  return `${apiBase}${separator}${url}`;
}
