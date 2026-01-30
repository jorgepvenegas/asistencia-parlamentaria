/**
 * String slugification utility for converting text to URL-safe slugs.
 */

/**
 * Convert text to lowercase slug format (remove spaces, special chars).
 * Replaces spaces with hyphens and removes tildes.
 */
export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/~/g, '');
}
