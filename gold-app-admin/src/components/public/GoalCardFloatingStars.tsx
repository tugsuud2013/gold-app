type StarSpec = {
  top: string;
  left?: string;
  right?: string;
  size: number;
  dur: number;
  delay: number;
  dx: number;
  dy: number;
};

/** Stars spread across full mission card, weighted toward image (right) side */
const GOAL_STARS: StarSpec[] = [
  { top: "3%", right: "3%", size: 5, dur: 4.6, delay: 0, dx: 3, dy: -20 },
  { top: "6%", left: "58%", size: 4, dur: 5.2, delay: 0.4, dx: -5, dy: -26 },
  { top: "4%", left: "78%", size: 5, dur: 4.4, delay: 0.9, dx: 6, dy: -22 },
  { top: "10%", right: "18%", size: 3, dur: 5.8, delay: 1.2, dx: 8, dy: -18 },
  { top: "14%", left: "52%", size: 4, dur: 4.9, delay: 1.7, dx: -4, dy: -30 },
  { top: "12%", right: "8%", size: 3, dur: 6.1, delay: 0.2, dx: -9, dy: -24 },
  { top: "18%", left: "68%", size: 5, dur: 5.4, delay: 2.1, dx: 4, dy: -28 },
  { top: "20%", right: "4%", size: 4, dur: 4.7, delay: 2.6, dx: 7, dy: -20 },
  { top: "24%", left: "48%", size: 3, dur: 6.4, delay: 0.6, dx: -6, dy: -32 },
  { top: "28%", left: "72%", size: 4, dur: 5, delay: 1.4, dx: 5, dy: -26 },
  { top: "26%", right: "14%", size: 5, dur: 5.6, delay: 1.9, dx: -7, dy: -22 },
  { top: "32%", left: "62%", size: 3, dur: 4.5, delay: 3, dx: 10, dy: -18 },
  { top: "34%", right: "6%", size: 4, dur: 6.8, delay: 0.8, dx: -4, dy: -34 },
  { top: "38%", left: "54%", size: 4, dur: 5.3, delay: 2.3, dx: 6, dy: -24 },
  { top: "42%", left: "82%", size: 5, dur: 4.8, delay: 1.1, dx: -8, dy: -28 },
  { top: "40%", right: "22%", size: 3, dur: 5.9, delay: 1.6, dx: 5, dy: -30 },
  { top: "48%", left: "46%", size: 4, dur: 6.2, delay: 2.8, dx: -5, dy: -20 },
  { top: "50%", right: "3%", size: 3, dur: 4.3, delay: 0.5, dx: 9, dy: -26 },
  { top: "54%", left: "70%", size: 5, dur: 5.5, delay: 1.8, dx: -3, dy: -22 },
  { top: "58%", right: "12%", size: 3, dur: 6.6, delay: 2.4, dx: 7, dy: -16 },
  { top: "56%", left: "58%", size: 4, dur: 5.1, delay: 3.2, dx: -10, dy: -24 },
  { top: "64%", left: "76%", size: 4, dur: 4.2, delay: 0.3, dx: 4, dy: -18 },
  { top: "68%", right: "5%", size: 3, dur: 5.7, delay: 2, dx: -6, dy: -14 },
  { top: "72%", left: "50%", size: 5, dur: 6, delay: 1.3, dx: 8, dy: -20 },
  { top: "76%", right: "16%", size: 3, dur: 4.9, delay: 2.7, dx: -4, dy: -12 },
  { top: "82%", left: "64%", size: 4, dur: 5.4, delay: 1.5, dx: 6, dy: -16 },
  { top: "88%", right: "4%", size: 5, dur: 5.8, delay: 0.7, dx: -5, dy: -10 },
  { top: "92%", left: "56%", size: 3, dur: 4.4, delay: 2.2, dx: 4, dy: -14 },
  { top: "8%", left: "44%", size: 3, dur: 5.1, delay: 0.35, dx: -3, dy: -22 },
  { top: "16%", left: "84%", size: 4, dur: 4.3, delay: 1.05, dx: 5, dy: -24 },
  { top: "22%", right: "26%", size: 3, dur: 6.3, delay: 2.55, dx: -6, dy: -18 },
  { top: "30%", left: "80%", size: 5, dur: 5.7, delay: 0.95, dx: 7, dy: -26 },
  { top: "36%", right: "10%", size: 4, dur: 4.6, delay: 2.15, dx: -4, dy: -20 },
  { top: "44%", left: "74%", size: 3, dur: 5.9, delay: 1.25, dx: 9, dy: -22 },
  { top: "46%", right: "28%", size: 4, dur: 6.5, delay: 3.15, dx: -7, dy: -16 },
  { top: "52%", left: "60%", size: 3, dur: 4.8, delay: 0.75, dx: 4, dy: -28 },
  { top: "60%", left: "48%", size: 5, dur: 5.2, delay: 2.45, dx: -8, dy: -18 },
  { top: "62%", right: "20%", size: 3, dur: 6.1, delay: 1.55, dx: 6, dy: -24 },
  { top: "66%", left: "86%", size: 4, dur: 4.4, delay: 0.15, dx: -5, dy: -20 },
  { top: "70%", right: "24%", size: 3, dur: 5.6, delay: 2.85, dx: 8, dy: -14 },
  { top: "74%", left: "66%", size: 4, dur: 6.4, delay: 1.35, dx: -3, dy: -22 },
  { top: "78%", left: "80%", size: 3, dur: 4.7, delay: 2.05, dx: 5, dy: -16 },
  { top: "80%", right: "8%", size: 5, dur: 5.3, delay: 0.55, dx: -9, dy: -12 },
  { top: "84%", left: "52%", size: 3, dur: 6.7, delay: 2.35, dx: 4, dy: -18 },
  { top: "86%", right: "14%", size: 4, dur: 4.5, delay: 1.65, dx: -6, dy: -14 },
  { top: "90%", left: "72%", size: 3, dur: 5.8, delay: 3.05, dx: 7, dy: -10 },
  { top: "94%", right: "10%", size: 4, dur: 6.2, delay: 0.85, dx: -4, dy: -12 },
  { top: "5%", left: "64%", size: 3, dur: 5.4, delay: 2.65, dx: 3, dy: -26 },
  { top: "11%", right: "32%", size: 4, dur: 4.9, delay: 1.45, dx: -7, dy: -20 },
  { top: "19%", left: "56%", size: 3, dur: 6.6, delay: 0.25, dx: 6, dy: -30 },
  { top: "33%", left: "88%", size: 4, dur: 5.1, delay: 2.75, dx: -5, dy: -24 },
  { top: "41%", right: "2%", size: 3, dur: 4.2, delay: 1.85, dx: 8, dy: -18 },
  { top: "59%", left: "84%", size: 5, dur: 6.8, delay: 0.65, dx: -4, dy: -26 },
  { top: "67%", left: "42%", size: 3, dur: 5.5, delay: 2.95, dx: 5, dy: -16 },
  { top: "95%", left: "68%", size: 3, dur: 4.6, delay: 1.95, dx: -6, dy: -8 },
];

export default function GoalCardFloatingStars() {
  return (
    <div className="public-goal-card-stars pointer-events-none absolute inset-0 z-[1]" aria-hidden>
      {GOAL_STARS.map((star, i) => (
        <span
          key={i}
          className="goal-floating-star"
          style={{
            top: star.top,
            left: star.left,
            right: star.right,
            width: star.size,
            height: star.size,
            ["--star-dur" as string]: `${star.dur}s`,
            ["--star-delay" as string]: `${star.delay}s`,
            ["--star-dx" as string]: `${star.dx}px`,
            ["--star-dy" as string]: `${star.dy}px`,
          }}
        />
      ))}
    </div>
  );
}
