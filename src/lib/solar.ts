/*
  Solar geometry for the NoVA corridor — powers the Living Instrument.
  Thermal inspection windows are physics-bound: best ΔT contrast occurs
  pre-dawn and post-sunset. All values computed locally; nothing fetched.
  NOAA simplified solar position (accuracy ~0.1°, plenty for ops display).
*/

export const CORRIDOR = { lat: 39.02, lon: -77.45, label: 'MID-ATLANTIC SECTOR' } as const;

const DEG = Math.PI / 180;

/** Sun elevation in degrees at a given time/place. */
export function sunElevation(date: Date, lat = CORRIDOR.lat, lon = CORRIDOR.lon): number {
  const d = date.getTime() / 86400000 - 10957.5; // days since J2000
  const g = (357.528 + 0.9856003 * d) * DEG;     // mean anomaly
  const L = (280.46 + 0.9856474 * d) * DEG;      // mean longitude
  const lam = L + (1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * DEG;
  const eps = 23.439 * DEG;
  const dec = Math.asin(Math.sin(eps) * Math.sin(lam));
  const ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam));
  const gmst = (280.46061837 + 360.98564736629 * d) % 360;
  const H = (gmst + lon) * DEG - ra;
  const phi = lat * DEG;
  return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H)) / DEG;
}

export type ScanWindowState =
  | { state: 'open'; reason: string }
  | { state: 'next'; at: Date; reason: string };

/**
 * Thermal scan windows: sun below ~0° but above deep night gives residual
 * heat contrast; pre-dawn (coolest ambient) and post-sunset (max stored heat
 * release) are optimal. We model the window as sun elevation in [-12°, +6°]
 * around sunrise/sunset — the operational truth without overclaiming.
 */
export function scanWindow(now: Date = new Date()): ScanWindowState {
  const el = sunElevation(now);
  if (el >= -12 && el <= 6) {
    return { state: 'open', reason: 'ΔT CONDITIONS FAVORABLE' };
  }
  // Find next boundary crossing by stepping 5-minute increments (≤24h scan).
  for (let m = 5; m <= 1440; m += 5) {
    const t = new Date(now.getTime() + m * 60000);
    const e = sunElevation(t);
    if (e >= -12 && e <= 6) {
      return { state: 'next', at: t, reason: el > 6 ? 'AWAITING SOLAR DECAY' : 'AWAITING PRE-DAWN WINDOW' };
    }
  }
  return { state: 'open', reason: 'ΔT CONDITIONS FAVORABLE' };
}

/** True while the sun is below civil twilight (-6°): NIGHT OPS. */
export function isNightOps(now: Date = new Date()): boolean {
  return sunElevation(now) < -6;
}

export function fmtTimeET(d: Date): string {
  return d
    .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/New_York' })
    .replace(/^24/, '00') + ' ET';
}
