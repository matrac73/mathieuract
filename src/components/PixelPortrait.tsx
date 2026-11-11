"use client";

import { useEffect, useRef } from "react";

// Portrait that starts as a handful of big pixels. While hovered (or after a tap),
// every pixel splits in four, again and again, until the real photo is there.
const LEVELS = [8, 16, 32, 64, 128, 256]; // pixels per side; one more step = the untouched image
const SIZE = 512;

export function PixelPortrait({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const api = useRef({ want: 0, toggle: () => {} });

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const small = document.createElement("canvas");
    const img = new Image();
    let level = 0, timer: ReturnType<typeof setTimeout> | undefined, ready = false;

    const draw = () => {
      if (!ready) return;
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - side) / 2, sy = (img.naturalHeight - side) / 2;
      ctx.clearRect(0, 0, SIZE, SIZE);
      if (level >= LEVELS.length) {
        ctx.imageSmoothingEnabled = true;
        ctx.filter = "none";
        ctx.drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE);
        return;
      }
      const n = LEVELS[level];
      small.width = small.height = n;
      const s = small.getContext("2d")!;
      s.imageSmoothingEnabled = true;
      s.drawImage(img, sx, sy, side, side, 0, 0, n, n);
      ctx.imageSmoothingEnabled = false;
      ctx.filter = "grayscale(1) contrast(1.15)";
      ctx.drawImage(small, 0, 0, n, n, 0, 0, SIZE, SIZE);
    };
    const step = () => {
      const want = api.current.want;
      if (level === want) return;
      level += want > level ? 1 : -1;
      draw();
      timer = setTimeout(step, want > level ? 105 : 55);
    };
    const go = (want: number) => {
      api.current.want = want;
      clearTimeout(timer);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { level = want; draw(); } else step();
    };
    api.current.toggle = () => go(api.current.want ? 0 : LEVELS.length);
    const enter = (e: PointerEvent) => { if (e.pointerType === "mouse") go(LEVELS.length); };
    const leave = (e: PointerEvent) => { if (e.pointerType === "mouse") go(0); };
    const tap = (e: PointerEvent) => { if (e.pointerType !== "mouse") api.current.toggle(); };
    cv.addEventListener("pointerenter", enter);
    cv.addEventListener("pointerleave", leave);
    cv.addEventListener("pointerup", tap);
    img.onload = () => { ready = true; draw(); };
    img.src = src;
    return () => {
      clearTimeout(timer);
      cv.removeEventListener("pointerenter", enter);
      cv.removeEventListener("pointerleave", leave);
      cv.removeEventListener("pointerup", tap);
    };
  }, [src]);

  return <canvas ref={ref} className={className} width={SIZE} height={SIZE} role="img" aria-label={alt} />;
}
