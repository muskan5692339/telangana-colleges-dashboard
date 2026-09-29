/** Convert a college-sheet selection cell into a headcount. */
export function asHeadcount(value: number, enrolled: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (enrolled > 0 && value > 0 && value < 1) {
    return Math.round(value * enrolled);
  }
  if (value > 0 && value < 1) return 0;
  if (enrolled > 0 && value > enrolled && value <= 100) {
    return Math.round((value / 100) * enrolled);
  }
  return Math.round(value);
}

export function selectionPct(selected: number, enrolled: number): number | null {
  if (!Number.isFinite(enrolled) || enrolled <= 0) return null;
  return (asHeadcount(selected, enrolled) / enrolled) * 100;
}

export function formatSelectionPct(pct: number | null): string {
  if (pct == null) return "—";
  return `${Math.round(pct)}%`;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function mix(from: [number, number, number], to: [number, number, number], t: number): string {
  const r = Math.round(lerp(from[0], to[0], t));
  const g = Math.round(lerp(from[1], to[1], t));
  const b = Math.round(lerp(from[2], to[2], t));
  return `rgb(${r} ${g} ${b})`;
}

const RED: [number, number, number] = [220, 38, 38];
const YELLOW: [number, number, number] = [202, 138, 4];
const GREEN: [number, number, number] = [22, 163, 74];
const BG_RED: [number, number, number] = [254, 226, 226];
const BG_YELLOW: [number, number, number] = [254, 249, 195];
const BG_GREEN: [number, number, number] = [220, 252, 231];
const FG_RED: [number, number, number] = [127, 29, 29];
const FG_YELLOW: [number, number, number] = [113, 63, 18];
const FG_GREEN: [number, number, number] = [20, 83, 45];

/** 0% red → 50% yellow → 100% green, for selection % on the college page. */
export function selectionTone(pct: number | null): { bg: string; fg: string } {
  if (pct == null) {
    return { bg: "var(--color-cream)", fg: "var(--color-navy)" };
  }
  const t = Math.max(0, Math.min(100, pct)) / 100;
  const local = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
  if (t < 0.5) {
    return {
      bg: mix(BG_RED, BG_YELLOW, local),
      fg: mix(FG_RED, FG_YELLOW, local),
    };
  }
  return {
    bg: mix(BG_YELLOW, BG_GREEN, local),
    fg: mix(FG_YELLOW, FG_GREEN, local),
  };
}

export function selectionBarColor(pct: number | null): string {
  if (pct == null) return "#e5e0d6";
  const t = Math.max(0, Math.min(100, pct)) / 100;
  const local = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
  return t < 0.5 ? mix(RED, YELLOW, local) : mix(YELLOW, GREEN, local);
}
