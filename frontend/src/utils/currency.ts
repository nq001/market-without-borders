/**
 * Formats a raw integer price stored in minor units (e.g. cents) into a standard display string.
 * According to MWB design spec:
 * 150000 minor units -> "1,500.00"
 */
export function formatPrice(minorUnits: number | string | null | undefined, includeSymbol = false): string {
  if (minorUnits === null || minorUnits === undefined || isNaN(Number(minorUnits))) {
    return includeSymbol ? '$0.00' : '0.00';
  }

  const numericValue = typeof minorUnits === 'string' ? parseFloat(minorUnits) : minorUnits;
  const majorUnits = numericValue / 100;

  const formatted = majorUnits.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return includeSymbol ? `$${formatted}` : formatted;
}

export function formatCurrency(minorUnits: number | string | null | undefined): string {
  return formatPrice(minorUnits, true);
}

