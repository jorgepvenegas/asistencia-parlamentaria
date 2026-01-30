/**
 * Data parsing utilities for extracting and transforming scraped values.
 */

/**
 * Parse percentage string to number.
 * Handles formats like "95,5%" and returns numeric value.
 */
export function parsePercentage(percentageStr: string): number {
  return Number(percentageStr.trim().replace('%', '').replace(',', '.'));
}
