"use client";

import { useEffect } from "react";

/**
 * Drives the `.scrolly` figures of an article: the step being read under the pinned figure
 * decides which SVG elements are shown (data-step <= n shown, data-hide <= n hidden).
 * The reading line is measured from the figure itself (a little below its bottom edge), so a step
 * never becomes the current one while it is still hidden behind the figure, whatever the screen.
 * Without JavaScript the figure simply shows its final state.
 */
export function ScrollFigures() {
  useEffect(() => {
    const figs = [...document.querySelectorAll<HTMLElement>(".scrolly")].map((root) => {
      const steps = [...root.querySelectorAll<HTMLElement>(".scrolly-steps > li")];
      const fig = root.querySelector<HTMLElement>(".scrolly-fig");
      const parts = [...root.querySelectorAll<SVGElement>(".scrolly-svg [data-step], .scrolly-svg [data-hide]")];
      return { root, steps, fig, parts, n: 0 };
    }).filter((f) => f.steps.length && f.fig);

    const show = (f: (typeof figs)[number], n: number) => {
      if (f.n === n) return;
      f.n = n;
      for (const el of f.parts) {
        const from = Number(el.dataset.step ?? 0), until = Number(el.dataset.hide ?? Infinity);
        el.classList.toggle("on", n >= from && n < until);
      }
      f.steps.forEach((s, i) => s.classList.toggle("current", i + 1 === n));
    };

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      for (const f of figs) {
        const r = f.root.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) continue;
        const bottom = Math.min(vh * 0.8, f.fig!.getBoundingClientRect().bottom), line = bottom + (vh - bottom) * 0.6;
        let n = 1;
        f.steps.forEach((s, i) => { if (s.getBoundingClientRect().top <= line) n = i + 1; });
        show(f, n);
      }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(update); };

    for (const f of figs) { f.root.classList.add("js"); show(f, 1); }
    kick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      for (const f of figs) f.root.classList.remove("js");
    };
  }, []);
  return null;
}
