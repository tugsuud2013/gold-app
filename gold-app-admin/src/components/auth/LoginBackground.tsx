"use client";

const PARTICLES = [
  { left: "12%", top: "18%", size: 4, delay: "0s", duration: "7s" },
  { left: "78%", top: "14%", size: 3, delay: "1.2s", duration: "8s" },
  { left: "24%", top: "62%", size: 5, delay: "0.6s", duration: "9s" },
  { left: "68%", top: "58%", size: 3, delay: "2s", duration: "7.5s" },
  { left: "44%", top: "34%", size: 2, delay: "1.8s", duration: "6.5s" },
  { left: "86%", top: "72%", size: 4, delay: "0.4s", duration: "8.5s" },
  { left: "8%", top: "82%", size: 3, delay: "2.4s", duration: "7s" },
  { left: "52%", top: "78%", size: 2, delay: "1s", duration: "6s" },
];

export default function LoginBackground() {
  return (
    <div className="login-page-bg" aria-hidden>
      <div className="login-page-glow login-page-glow--left" />
      <div className="login-page-glow login-page-glow--right" />
      <div className="login-page-particles">
        {PARTICLES.map((particle, index) => (
          <span
            key={index}
            className="login-page-particle"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>
    </div>
  );
}
