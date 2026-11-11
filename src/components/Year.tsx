"use client";

import { useEffect, useState } from "react";

/** Current year, read in the visitor's browser when the page opens (the site itself is built once). */
export function Year() {
  const [y, setY] = useState(() => new Date().getFullYear());
  useEffect(() => setY(new Date().getFullYear()), []);
  return <span suppressHydrationWarning>{y}</span>;
}
