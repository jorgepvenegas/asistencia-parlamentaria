/**
 * Date utility functions for formatting and generating date ranges.
 */

/**
 * Format a date as DD/MM/YYYY string.
 */
export function formatDateDDMMYYYY(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Get today's date formatted as DD/MM/YYYY.
 */
export function getTodayFormatted(): string {
  return formatDateDDMMYYYY(new Date());
}

/**
 * Generate date range for current month (first day to last day).
 * Returns both dates in DD/MM/YYYY format.
 */
export function generateCurrentMonthDates(): { from: string; to: string } {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    from: formatDateDDMMYYYY(firstDay),
    to: formatDateDDMMYYYY(lastDay),
  };
}

/**
 * Get current year and month as integers.
 */
export function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/**
 * Get full year date range (Jan 1 - Dec 31) in DD/MM/YYYY format.
 */
export function getYearDateRange(year: number): { from: string; to: string } {
  return {
    from: `01/01/${year}`,
    to: `31/12/${year}`,
  };
}
