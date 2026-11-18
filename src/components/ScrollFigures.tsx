"use client";

import { useEffect } from "react";

/**
 * Drives the `.scrolly` figures of an article: the step whose text sits under the pinned figure
 * decides which SVG elements are shown (data-step <= n shown, data-hide <= n hidden).
 * Without JavaScript the figure simply shows its final state.
 */
export function ScrollFigures() {
  useEffect(() => {
    const cleanups: (() => void)[] = [];
    document.querySelectorAll<HTMLElement>(".scrolly").forEach((root) => {
      const steps = [...root.querySelectorAll<HTMLElement>(".scrolly-steps > li")];
      if (!steps.length) return;
      const parts = [...root.querySelectorAll<SVGElement>(".scrolly-svg [data-step], .scrolly-svg [data-hide]")];
      const show = (n: number) => {
        for (const el of parts) {
          const from = Number(el.dataset.step ?? 0), until = Number(el.dataset.hide ?? Infinity);
          el.classList.toggle("on", n >= from && n < until);
        }
        steps.forEach((s, i) => s.classList.toggle("current", i + 1 === n));
      };
      root.classList.add("js");
      show(1);
      // the "reading band" is the strip of viewport just below the pinned figure
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) if (e.isIntersecting) show(Number((e.target as HTMLElement).dataset.step));
      }, { rootMargin: "-62% 0px -18% 0px" });
      steps.forEach((s) => io.observe(s));
      cleanups.push(() => { io.disconnect(); root.classList.remove("js"); });
    });
    return () => cleanups.forEach((c) => c());
  }, []);
  return null;
}
