"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { scrollToPublicSection } from "./publicNavSections";

const SHOW_AFTER_PX = 480;

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    scrollToPublicSection("#home");
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Эхлэл рүү буцах"
      className={`public-scroll-top fixed bottom-6 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-gold/35 bg-[#0a0a0a]/90 text-gold-light shadow-[0_4px_24px_rgba(0,0,0,0.45),0_0_20px_rgba(212,175,55,0.12)] backdrop-blur-sm transition-all duration-300 hover:border-gold/55 hover:bg-gold/10 hover:text-white sm:bottom-8 sm:right-6 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp size={20} strokeWidth={2.25} aria-hidden />
    </button>
  );
}
