export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
