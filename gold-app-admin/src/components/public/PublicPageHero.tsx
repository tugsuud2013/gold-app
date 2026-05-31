import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  description?: string;
};

export default function PublicPageHero({ title, description }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-gold/10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.14)_0%,_transparent_60%)]" />
      <div className="public-container relative mx-auto px-4 py-20 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="public-section-title">{title}</h1>
          {description && (
            <p className="mt-5 text-base leading-relaxed text-zinc-400 lg:text-lg">
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
