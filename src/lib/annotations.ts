/*
  Annotations as data (C1) — bounding boxes/labels/confidence live in
  JSON-shaped objects; AnnotatedFrame renders the SVG overlay. Adding a
  finding to a hero is a data edit, not art.
*/

export interface Annotation {
  /** Percent coordinates within the frame, 0-100 */
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;        // "ANOMALY · ΔT +14.2°C"
  confidence?: number;  // 0-1 -> "CONF 0.94"
  /** Label placement relative to box */
  labelAt?: 'top' | 'bottom';
}

export interface FrameMeta {
  /** Caption bar, e.g. "FRAME 0331 · DEMONSTRATION ANALYSIS · 39.02°N 77.45°W" */
  caption: string;
  /** Geo bounds for the crosshair coordinate readout (B2) */
  geo?: { latTop: number; latBottom: number; lonLeft: number; lonRight: number };
}

/** Perimeter of a percent-box in viewBox units (for stroke-dash draw-in). */
export function boxPerimeter(a: Annotation, vw = 1000, vh = 625): number {
  const w = (a.w / 100) * vw;
  const h = (a.h / 100) * vh;
  return Math.round(2 * (w + h));
}
