
/**
 * Format a number as a currency string
 * @param value The number to format
 * @param currency The currency code (default: 'USD')
 * @param locale The locale for formatting (default: 'en-US')
 * @returns A formatted currency string
 */
export function formatCurrency(value: number, currency = 'USD', locale = 'en-US'): string {
  if (value === null || value === undefined) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a date as a localized string
 * @param date The date to format
 * @param locale The locale for formatting (default: 'en-US')
 * @returns A formatted date string
 */
export function formatDate(date: Date | string, locale = 'en-US'): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Format a number as a percentage
 * @param value The number to format as a percentage
 * @param decimalPlaces The number of decimal places (default: 0)
 * @returns A formatted percentage string
 */
export function formatPercent(value: number, decimalPlaces = 0): string {
  if (value === null || value === undefined) return '';
  
  return `${value.toFixed(decimalPlaces)}%`;
}
