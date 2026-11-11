"use client";

import { useEffect, useState } from "react";
import { Scramble } from "./Scramble";

/** Cycles through short lines, each one scrambling into the next. */
export function Rotator({ items, every = 3400 }: { items: string[]; every?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % items.length), every);
    return () => clearInterval(t);
  }, [items.length, every]);
  return <Scramble text={items[i]} duration={650} onMount={false} />;
}
