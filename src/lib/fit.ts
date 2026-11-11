"use client";

import { useEffect, type RefObject } from "react";

/**
 * One-line titles that never overflow: the font size is the one at which the LONGEST of `texts` fits the
 * width of the element, and every title of the series uses it — so they all have the same size and none is cropped.
 * Measured on a canvas with the real font (again once the web font has loaded), not on the live, flickering text.
 */
export function useFitLine(ref: RefObject<HTMLElement | null>, texts: string[]) {
  const key = texts.join("|");
  useEffect(() => {
    const el = ref.current, box = el?.parentElement;
    if (!el || !box) return;
    const ctx = document.createElement("canvas").getContext("2d")!;
    let dead = false;
    const fit = () => {
      if (dead) return;
      el.style.fontSize = "";
      const cs = getComputedStyle(el), base = parseFloat(cs.fontSize), room = el.clientWidth;
      const upper = cs.textTransform === "uppercase", spacing = parseFloat(cs.letterSpacing) || 0;
      ctx.font = `${cs.fontWeight} ${base}px ${cs.fontFamily}`;
      const need = Math.max(...key.split("|").map((t) => ctx.measureText(upper ? t.toUpperCase() : t).width + spacing * t.length));
      if (need > room * 0.97 && need > 0) el.style.fontSize = `${Math.max(11, Math.floor(base * ((room * 0.97) / need) * 10) / 10)}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => { dead = true; ro.disconnect(); };
  }, [ref, key]);
}
