import { Award, Coins, Scale } from "lucide-react";

const stats = [
  {
    icon: Scale,
    value: "152.3456 г",
    label: "Алтан үлдэгдэл",
  },
  {
    icon: Coins,
    value: "₮5,250,000",
    label: "Нийт хөрөнгийн дүн",
  },
  {
    icon: Award,
    value: "Gold Member",
    label: "Онцгой гишүүн",
  },
];

type HeroStatCardsProps = {
  setCardRef?: (index: number) => (el: HTMLDivElement | null) => void;
};

export default function HeroStatCards({ setCardRef }: HeroStatCardsProps) {
  return (
    <div className="flex flex-col gap-3.5">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            ref={setCardRef?.(index)}
            className="hero-stat-card flex min-w-[210px] will-change-transform items-center gap-3.5 rounded-xl px-5 py-4 sm:min-w-[228px]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold/25 bg-gold/5">
              <Icon className="text-gold-light" size={22} strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="text-[1.05rem] font-bold leading-tight tracking-tight text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-sm font-medium leading-snug text-zinc-300">
                {stat.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
