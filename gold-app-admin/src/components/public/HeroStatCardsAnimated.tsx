"use client";

import { useEffect, useRef } from "react";
import HeroStatCards from "./HeroStatCards";
import { prefersReducedMotion } from "./heroMotion";

export default function HeroStatCardsAnimated() {
  const statCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let frame = 0;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const elapsed = (now - start) / 1000;

      statCardRefs.current.forEach((el, i) => {
        if (!el) return;
        const y = Math.sin(elapsed * 0.9 + i * 1.15) * 4;
        el.style.transform = `translateY(${y}px)`;
      });

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <HeroStatCards
      setCardRef={(index) => (el) => {
        statCardRefs.current[index] = el;
      }}
    />
  );
}
