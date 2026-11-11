// Tiny pixel-art helpers shared by the canvases.

export const TRAIN = [
  "..#########..",
  ".###########.",
  ".#o##o##o##o.",
  ".###########.",
  "#############",
  ".##.......##.",
];

/** Draws a sprite centred on (cx, cy): "#" in `ink`, "o" in `paper`, on a `paper` plate. */
export function sprite(g: CanvasRenderingContext2D, rows: string[], cx: number, cy: number, s: number, ink: string, paper: string) {
  const w = rows[0].length * s, h = rows.length * s, x0 = Math.round(cx - w / 2), y0 = Math.round(cy - h / 2);
  g.fillStyle = paper;
  g.fillRect(x0 - 3, y0 - 3, w + 6, h + 6);
  for (let r = 0; r < rows.length; r++)
    for (let c = 0; c < rows[r].length; c++) {
      const ch = rows[r][c];
      if (ch === ".") continue;
      g.fillStyle = ch === "o" ? paper : ink;
      g.fillRect(x0 + c * s, y0 + r * s, s, s);
    }
}

/** Point at t on the arc that stands for a transfer between two places (bulges upwards on screen). */
export function arc(ax: number, ay: number, bx: number, by: number, t: number): [number, number] {
  const mx = (ax + bx) / 2, my = (ay + by) / 2 - Math.hypot(bx - ax, by - ay) * 0.3, u = 1 - t;
  return [u * u * ax + 2 * u * t * mx + t * t * bx, u * u * ay + 2 * u * t * my + t * t * by];
}
