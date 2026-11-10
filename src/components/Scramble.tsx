"use client";

import { createElement, useEffect, useRef } from "react";

const GLYPHS = "#/\\<>[]{}=+*-_01XZ";
const rnd = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

/** Imperative scramble: random glyphs resolve left-to-right into `to`. Returns a cancel fn. */
export function scrambleTo(el: HTMLElement, to: string, duration = 550) {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = to;
    return () => {};
  }
  const start = performance.now();
  let raf = 0;
  let last = 0;
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    if (now - last > 32 || p === 1) {
      last = now;
      const solved = Math.floor(p * to.length);
      let out = to.slice(0, solved);
      for (let i = solved; i < to.length; i++) out += to[i] === " " ? " " : rnd();
      el.textContent = out;
    }
    if (p < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

type Props = { text: string; as?: string; className?: string; duration?: number; delay?: number; onMount?: boolean };

/** Renders `text`; whenever it changes (and optionally on mount), it scrambles into place. */
export function Scramble({ text, as = "span", className, duration = 550, delay = 0, onMount = true }: Props) {
  const ref = useRef<HTMLElement>(null);
  const first = useRef(true);
  // React only ever renders the initial text; later changes are written imperatively,
  // so the scramble never fights React's reconciliation of the text node.
  const initial = useRef(text).current;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.setAttribute("aria-label", text);
    if (first.current) {
      first.current = false;
      if (!onMount) return;
    }
    let cancel = () => {};
    const t = setTimeout(() => (cancel = scrambleTo(el, text, duration)), delay);
    return () => {
      clearTimeout(t);
      cancel();
      el.textContent = text;
    };
  }, [text, duration, delay, onMount]);
  return createElement(as, { ref, className, suppressHydrationWarning: true }, initial);
}

/** Link/label that re-scrambles on hover. */
export function HoverScramble({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const cancel = useRef(() => {});
  return (
    <span
      ref={ref}
      className={className}
      aria-label={text}
      onPointerEnter={() => {
        cancel.current();
        if (ref.current) cancel.current = scrambleTo(ref.current, text, 380);
      }}
    >
      {text}
    </span>
  );
}
