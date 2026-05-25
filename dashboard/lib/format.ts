export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatVnd(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export function formatVndFull(n: number): string {
  return n.toLocaleString("en-US") + " ₫";
}

export function formatPct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function formatDelta(n: number | null): string {
  if (n === null || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

export function formatHours(n: number): string {
  if (n < 1) return `${Math.round(n * 60)} min`;
  if (n < 48) return `${n.toFixed(1)} h`;
  return `${(n / 24).toFixed(1)} d`;
}

export function formatKpi(value: number, unit: "count" | "vnd" | "pct" | "hours"): string {
  switch (unit) {
    case "count":
      return formatNumber(value);
    case "vnd":
      return formatVnd(value) + " ₫";
    case "pct":
      return formatPct(value);
    case "hours":
      return formatHours(value);
  }
}
