"use client";

import { useEffect, useRef } from "react";

// Black-and-white portrait that starts as four big pixels. The pixel under the pointer
// splits in four; its neighbours stay whole. Six splits, no more, and the face is sharp where you look.
const G = 128; // finest grid (pixels per side): 2 × 2 big pixels, split six times
const SIZE = 512; // canvas backing size
const AGE = 40; // ms a pixel must exist before it can split again

export function PixelPortrait({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const img = new Image();
    const size = new Uint16Array(G * G).fill(G / 2); // size of the leaf covering each cell
    const born = new Float64Array(G * G);
    let sat: Float64Array | null = null; // summed-area table of the grey image
    let timer: ReturnType<typeof setInterval> | undefined, at: [number, number] | null = null;
    const k = SIZE / G;

    const paint = (x: number, y: number, s: number) => {
      const W = G + 1, t = sat!;
      const sum = t[(y + s) * W + x + s] - t[y * W + x + s] - t[(y + s) * W + x] + t[y * W + x];
      const v = Math.max(0, Math.min(255, ((sum / (s * s) - 128) * 1.15 + 128) | 0));
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(x * k, y * k, s * k, s * k);
    };
    const split = (cx: number, cy: number, now: number) => {
      const s = size[cy * G + cx];
      if (s <= 1 || now - born[cy * G + cx] < AGE) return;
      const x0 = Math.floor(cx / s) * s, y0 = Math.floor(cy / s) * s, h = s / 2;
      for (let y = y0; y < y0 + s; y++) for (let x = x0; x < x0 + s; x++) { size[y * G + x] = h; born[y * G + x] = now; }
      for (const [dx, dy] of [[0, 0], [h, 0], [0, h], [h, h]]) paint(x0 + dx, y0 + dy, h);
    };
    const tick = () => {
      if (!at || !sat) return;
      const now = performance.now(), s = size[at[1] * G + at[0]];
      split(at[0], at[1], now);
      if (s <= 8) // small pixels: the brush takes the four neighbours along, so the last levels do not drag
        for (const [dx, dy] of [[-s, 0], [s, 0], [0, -s], [0, s]]) {
          const x = at[0] + dx, y = at[1] + dy;
          if (x >= 0 && y >= 0 && x < G && y < G && size[y * G + x] >= s) split(x, y, now);
        }
    };
    const move = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      at = [Math.max(0, Math.min(G - 1, Math.floor(((e.clientX - r.left) / r.width) * G))), Math.max(0, Math.min(G - 1, Math.floor(((e.clientY - r.top) / r.height) * G)))];
      tick();
      timer ??= setInterval(tick, 30);
    };
    const leave = () => { at = null; clearInterval(timer); timer = undefined; };
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerdown", move);
    cv.addEventListener("pointerleave", leave);
    cv.addEventListener("pointercancel", leave);

    img.onload = () => {
      const off = document.createElement("canvas");
      off.width = off.height = G;
      const o = off.getContext("2d", { willReadFrequently: true })!;
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      o.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, G, G);
      const d = o.getImageData(0, 0, G, G).data, W = G + 1;
      sat = new Float64Array(W * W);
      for (let y = 0; y < G; y++) {
        let row = 0;
        for (let x = 0; x < G; x++) {
          const q = (y * G + x) * 4;
          row += 0.299 * d[q] + 0.587 * d[q + 1] + 0.114 * d[q + 2];
          sat[(y + 1) * W + x + 1] = sat[y * W + x + 1] + row;
        }
      }
      for (const [x, y] of [[0, 0], [G / 2, 0], [0, G / 2], [G / 2, G / 2]]) paint(x, y, G / 2);
    };
    img.src = src;
    return () => {
      clearInterval(timer);
      cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerdown", move);
      cv.removeEventListener("pointerleave", leave);
      cv.removeEventListener("pointercancel", leave);
    };
  }, [src]);

  return <canvas ref={ref} className={className} width={SIZE} height={SIZE} role="img" aria-label={alt} />;
}
