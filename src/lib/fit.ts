"use client";

import { useEffect, type RefObject } from "react";

/** Keeps a one-line title on one line: the font shrinks until `text` fits the width of the parent. */
export function useFitLine(ref: RefObject<HTMLElement | null>, text: string) {
  useEffect(() => {
    const el = ref.current, box = el?.parentElement;
    if (!el || !box) return;
    const fit = () => {
      el.style.fontSize = "";
      const base = parseFloat(getComputedStyle(el).fontSize), need = el.scrollWidth, room = el.clientWidth;
      if (need > room && need > 0) el.style.fontSize = `${Math.max(12, Math.floor(base * (room / need) * 0.985 * 10) / 10)}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [ref, text]);
}
