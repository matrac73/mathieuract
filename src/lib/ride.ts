// Small ride maths shared by the server (day averages) and the browser (live gauges).

type P = { d: number[]; e: number[]; sp: (number | null)[]; ts: number[] };
type W = { km: number; wind: number; headwind: number; precip: number; temp: number; windDir: number };

/** Weather at a given km: linear between the two nearest hourly samples (direction: the nearest one). */
export function weatherAt<T extends W>(wx: T[], km: number): T | null {
  if (!wx.length) return null;
  let b = wx.findIndex((w) => w.km >= km);
  if (b < 0) return wx[wx.length - 1];
  if (b === 0) return wx[0];
  const a = b - 1, t = (km - wx[a].km) / Math.max(0.001, wx[b].km - wx[a].km), near = t < 0.5 ? wx[a] : wx[b];
  const mix = (k: "wind" | "headwind" | "precip" | "temp") => wx[a][k] + (wx[b][k] - wx[a][k]) * t;
  return { ...near, wind: mix("wind"), headwind: mix("headwind"), precip: mix("precip"), temp: mix("temp") };
}

/**
 * Estimated power at each point, in watts — there is no power meter on the bike.
 * Gravity + rolling resistance + air drag (with the head/tail wind of the hour), for `mass` kg of rider, bike and bags.
 */
export function estimatePower(p: P, wx: W[], mass: number): number[] {
  const n = p.d.length, out = new Array<number>(n).fill(0);
  const G = 9.81, CRR = 0.005, CDA = 0.38, EFF = 0.97;
  let last = 0;
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - 3), b = Math.min(n - 1, i + 3), run = p.d[b] - p.d[a];
    const grade = run > 0 ? Math.max(-0.25, Math.min(0.25, (p.e[b] - p.e[a]) / run)) : 0;
    const kmh = p.sp[i] ?? last; last = kmh;
    const v = kmh / 3.6;
    if (v < 0.8) continue;
    const w = weatherAt(wx, p.d[i] / 1000), va = v + ((w?.headwind ?? 0) / 3.6) * 0.6; // wind at rider height ≈ 60 % of the 10 m wind
    const rho = 1.225 * Math.exp(-p.e[i] / 8500);
    const watts = (mass * G * (grade + CRR) * v + 0.5 * rho * CDA * va * Math.abs(va) * v) / EFF;
    out[i] = Math.max(0, Math.min(700, watts));
  }
  return out.map((_, i) => { let s = 0, k = 0; for (let j = Math.max(0, i - 1); j <= Math.min(n - 1, i + 1); j++) { s += out[j]; k++; } return s / k; });
}

/** Time-weighted average of the estimate over the moving parts of the day. */
export function averagePower(p: P, watts: number[]): number {
  let s = 0, t = 0;
  for (let i = 1; i < watts.length; i++) {
    const dt = p.ts[i] - p.ts[i - 1];
    if (dt <= 0 || dt > 600 || (p.sp[i] ?? 0) < 3) continue;
    s += watts[i] * dt; t += dt;
  }
  return t ? Math.round(s / t) : 0;
}

/** Metres climbed since the start, at each point; scaled so that the last value is the day's official total. */
export function cumulativeAscent(e: number[], total: number): number[] {
  const out = new Array<number>(e.length).fill(0);
  let ref = e[0], up = 0;
  for (let i = 1; i < e.length; i++) {
    if (e[i] > ref + 2) { up += e[i] - ref; ref = e[i]; } else if (e[i] < ref) ref = e[i];
    out[i] = up;
  }
  const k = up > 0 ? total / up : 0;
  return out.map((v) => v * k);
}

/** Low is white (the text colour), high leans yellow, the very top turns orange. `t` in 0..1. */
export function heat(t: number): string {
  const v = Math.min(1, Math.max(0, Number.isFinite(t) ? t : 0));
  return v <= 0.6
    ? `color-mix(in srgb, var(--warm) ${Math.round((v / 0.6) * 100)}%, var(--fg))`
    : `color-mix(in srgb, var(--accent) ${Math.round(((v - 0.6) / 0.4) * 100)}%, var(--warm))`;
}
