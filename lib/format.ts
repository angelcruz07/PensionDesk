export function formatCurrency(
  value: number | null,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  if (value === null || Number.isNaN(value)) return "—";
  const min = options?.minimumFractionDigits ?? 2;
  const max = options?.maximumFractionDigits ?? 2;
  const fmt = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  });
  return fmt.format(value);
}

export function formatNumber(
  value: number | null,
  fractionDigits: number = 2
): string {
  if (value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatInteger(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercentFromRate(rate: number | null): string {
  if (rate === null || Number.isNaN(rate)) return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rate);
}
