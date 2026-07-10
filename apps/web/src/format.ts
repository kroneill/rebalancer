/**
 * Rendering-time formatting only. Money stays integer cents everywhere in
 * the app; these helpers are the single place cents become display strings.
 */

export function formatCents(cents: number): string {
  const dollars = (Math.abs(cents) / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${cents < 0 ? "-" : ""}$${dollars}`;
}

/** "+$400.00" / "-$400.00", or an em dash for zero (no change). */
export function formatDelta(cents: number): string {
  if (cents === 0) return "—";
  return `${cents > 0 ? "+" : ""}${formatCents(cents)}`;
}

/** Basis points as a percentage, e.g. 2550 -> "25.5%". */
export function formatBpsAsPercent(bps: number): string {
  return `${(bps / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}%`;
}

/** Signed deviation like "+1.2%" (for basis-point deviations from target). */
export function formatSignedBpsAsPercent(bps: number): string {
  return `${bps >= 0 ? "+" : ""}${(bps / 100).toFixed(1)}%`;
}
