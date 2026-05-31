"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { easeOutCubic, prefersReducedMotion } from "./heroMotion";

const CHART_PATH =
  "M0 118 L55 102 L110 108 L165 72 L220 78 L275 48 L330 52 L385 28 L440 34 L495 14 L550 22 L605 8 L700 0";

const CHART_NODES: [number, number][] = [
  [0, 118],
  [110, 108],
  [165, 72],
  [275, 48],
  [385, 28],
  [495, 14],
  [605, 8],
  [700, 0],
];

const PARTICLES = [
  { left: "8%", top: "18%", size: 4 },
  { left: "22%", top: "62%", size: 3 },
  { left: "42%", top: "32%", size: 5 },
  { left: "58%", top: "52%", size: 3 },
  { left: "72%", top: "24%", size: 4 },
  { left: "86%", top: "68%", size: 2 },
  { left: "50%", top: "74%", size: 3 },
  { left: "35%", top: "45%", size: 2 },
];

const SPLASH_SPECS = Array.from({ length: 28 }, (_, i) => ({
  angle: (i / 28) * Math.PI * 2 + ((i % 5) - 2) * 0.18,
  spread: 0.5 + (i % 7) * 0.1,
  size: 2 + (i % 4),
  speed: 1.2 + (i % 6) * 0.18,
  phase: i * 0.52,
}));

function PhoneMockup({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="hero-phone-device relative w-[161px] sm:w-[175px] lg:w-[188px]">
      <div className="hero-phone-bezel rounded-[15px] p-[3px]">
        <div className="rounded-[12px] bg-zinc-950 p-[2px]">
          <div className="relative overflow-hidden rounded-[10px] bg-black">
            <div
              className="pointer-events-none absolute left-1/2 top-2.5 z-10 h-[4px] w-[72px] -translate-x-1/2 rounded-full bg-black/90"
              aria-hidden
            />
            <div className="aspect-[390/844]">
              {/* Native img avoids Next.js optimizer serving cached phone screens */}
              <img
                src={src}
                alt={alt}
                width={390}
                height={844}
                decoding="async"
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroPromoVisual() {
  const [motionOn, setMotionOn] = useState(false);

  const chartPathRef = useRef<SVGPathElement>(null);
  const chartFillRef = useRef<SVGPathElement>(null);
  const nodeRefs = useRef<(SVGCircleElement | null)[]>([]);
  const platformRef = useRef<HTMLDivElement>(null);
  const phoneLeftRef = useRef<HTMLDivElement>(null);
  const phoneRightRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const splashRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const chartLengthRef = useRef(0);
  const startRef = useRef<number | null>(null);
  const drawnRef = useRef(false);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    setMotionOn(!reduced);

    const path = chartPathRef.current;
    if (path) {
      chartLengthRef.current = path.getTotalLength();
      if (reduced) {
        path.style.strokeDasharray = "none";
        path.style.strokeDashoffset = "0";
      } else {
        path.style.strokeDasharray = `${chartLengthRef.current}`;
        path.style.strokeDashoffset = `${chartLengthRef.current}`;
      }
    }

    if (reduced) return;

    let frame = 0;

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = (now - startRef.current) / 1000;

      const pathEl = chartPathRef.current;
      if (pathEl && chartLengthRef.current > 0) {
        const drawT = Math.min(1, elapsed / 2.2);
        const eased = easeOutCubic(drawT);
        pathEl.style.strokeDashoffset = `${chartLengthRef.current * (1 - eased)}`;
        if (drawT >= 1) drawnRef.current = true;
      }

      if (chartFillRef.current) {
        const fillT = Math.min(1, Math.max(0, (elapsed - 0.6) / 1.4));
        chartFillRef.current.style.opacity = `${0.08 * easeOutCubic(fillT)}`;
      }

      nodeRefs.current.forEach((node, i) => {
        if (!node) return;
        const reveal = Math.min(1, Math.max(0, (elapsed - 0.15 * i) / 0.55));
        const pulse = drawnRef.current ? 1 + Math.sin(elapsed * 2 + i) * 0.12 : 1;
        node.setAttribute("opacity", `${0.7 * easeOutCubic(reveal)}`);
        node.setAttribute("r", `${2 * pulse}`);
      });

      particleRefs.current.forEach((el, i) => {
        if (!el) return;
        const phase = i * 0.65;
        const y = Math.sin(elapsed * 1.15 + phase) * 9;
        const scale = 1 + Math.sin(elapsed * 1.4 + phase) * 0.12;
        const opacity = 0.16 + (Math.sin(elapsed * 1.25 + phase) + 1) * 0.1;
        el.style.transform = `translateY(${y}px) scale(${scale})`;
        el.style.opacity = `${opacity}`;
      });

      if (phoneLeftRef.current) {
        const y = Math.sin(elapsed * 0.85) * 5;
        const rot = -9 + Math.sin(elapsed * 0.65) * 0.5;
        phoneLeftRef.current.style.transform = `translateY(${y}px) rotate(${rot}deg)`;
      }

      if (phoneRightRef.current) {
        const y = Math.sin(elapsed * 0.85 + 1.1) * 6;
        const rot = 9 + Math.sin(elapsed * 0.65 + 0.9) * 0.5;
        phoneRightRef.current.style.transform = `translateY(${y}px) rotate(${rot}deg)`;
      }

      if (platformRef.current) {
        const scale = 1 + Math.sin(elapsed * 0.95) * 0.035;
        const opacity = 0.82 + Math.sin(elapsed * 0.95) * 0.12;
        platformRef.current.style.transform = `translateX(-50%) scale(${scale})`;
        platformRef.current.style.opacity = `${opacity}`;
      }

      splashRefs.current.forEach((el, i) => {
        if (!el) return;
        const spec = SPLASH_SPECS[i];
        const burst =
          ((Math.sin(elapsed * spec.speed * 1.7 + spec.phase) + 1) / 2) ** 2.2;
        const drift = Math.sin(elapsed * 0.65 + spec.phase) * 0.2;
        const angle = spec.angle + drift;
        const dist = spec.spread * (48 + burst * 88);
        const x = Math.cos(angle) * dist;
        const y = -Math.abs(Math.sin(angle)) * dist * 0.22 - burst * 36 - 6;
        const deg = (angle * 180) / Math.PI + 90;
        const scale = 0.35 + burst * 1.1;
        el.style.transform = `translate(${x}px, ${y}px) rotate(${deg}deg) scale(${scale})`;
        el.style.opacity = `${0.08 + burst * 0.92}`;
      });

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
      <div className="relative flex h-[413px] items-end justify-center overflow-visible sm:h-[470px] lg:h-[499px]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_88%,_rgba(139,105,20,0.1)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_35%,_rgba(139,105,20,0.04)_0%,_transparent_45%)]" />

        <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              ref={(el) => {
                particleRefs.current[i] = el;
              }}
              className="hero-particle absolute rounded-full bg-gold/45"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex w-full items-end justify-center pb-20 lg:pb-24">
          <div className="relative h-[348px] w-[264px] shrink-0 overflow-visible sm:h-[384px] sm:w-[293px] lg:h-[410px] lg:w-[318px]">
            <div
              className="pointer-events-none absolute left-1/2 top-[26%] z-[1] h-[48%] w-[168%] max-w-none -translate-x-1/2 sm:top-[28%] lg:w-[175%]"
              aria-hidden
            >
              <svg
                className="h-full w-full opacity-35"
                viewBox="0 0 700 130"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  ref={chartFillRef}
                  d={`${CHART_PATH} L700 130 L0 130 Z`}
                  fill="url(#heroChartFill)"
                  style={{ opacity: motionOn ? 0 : 0.08 }}
                />
                <path
                  ref={chartPathRef}
                  d={CHART_PATH}
                  stroke="url(#heroChartGradient)"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {CHART_NODES.map(([cx, cy], i) => (
                  <circle
                    key={i}
                    ref={(el) => {
                      nodeRefs.current[i] = el;
                    }}
                    cx={cx}
                    cy={cy}
                    r="2"
                    fill="#b8860b"
                    opacity={motionOn ? 0 : 0.7}
                  />
                ))}
                <defs>
                  <linearGradient id="heroChartGradient" x1="0" y1="0" x2="700" y2="0">
                    <stop stopColor="#8b6914" stopOpacity="0.5" />
                    <stop offset="0.5" stopColor="#b8860b" stopOpacity="0.75" />
                    <stop offset="1" stopColor="#9a7b2f" stopOpacity="0.65" />
                  </linearGradient>
                  <linearGradient id="heroChartFill" x1="0" y1="0" x2="0" y2="130">
                    <stop stopColor="#8b6914" stopOpacity="0.15" />
                    <stop offset="1" stopColor="#8b6914" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div ref={platformRef} className="hero-gold-pedestal" aria-hidden>
              <span className="hero-pedestal-ambient" />
              <span className="hero-pedestal-surface" />
              <span className="hero-pedestal-ring hero-pedestal-ring--outer" />
              <span className="hero-pedestal-ring hero-pedestal-ring--mid" />
              <span className="hero-pedestal-ring hero-pedestal-ring--inner" />
              <span className="hero-pedestal-core" />
              <span className="hero-pedestal-mist" />
              <span className="hero-pedestal-splash" aria-hidden>
                {SPLASH_SPECS.map((spec, i) => (
                  <span
                    key={i}
                    ref={(el) => {
                      splashRefs.current[i] = el;
                    }}
                    className="hero-pedestal-splash__drop"
                    style={
                      {
                        "--drop-size": `${spec.size}px`,
                      } as CSSProperties
                    }
                  />
                ))}
              </span>
            </div>

            <div
              ref={phoneLeftRef}
              className="absolute bottom-0 left-0 z-10 will-change-transform"
              style={{ transform: "rotate(-9deg)" }}
            >
              <PhoneMockup src="/images/hero-login-v2.png" alt="GoldApp нэвтрэх дэлгэц" />
            </div>

            <div
              ref={phoneRightRef}
              className="absolute bottom-0 right-0 z-20 will-change-transform"
              style={{ transform: "rotate(9deg)" }}
            >
              <PhoneMockup
                src="/images/hero-dashboard-v2.png"
                alt="GoldApp dashboard дэлгэц"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
