"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import GoldAppLogo from "./GoldAppLogo";
import {
  publicNavSections,
  publicSectionIds,
  scrollToPublicSection,
} from "./publicNavSections";

function getActiveHash() {
  if (typeof window === "undefined") return "#home";
  return window.location.hash || "#home";
}

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("#home");

  useEffect(() => {
    const syncHash = () => setActiveHash(getActiveHash());
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash === "#") return;
    const timer = window.setTimeout(() => scrollToPublicSection(hash), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const sections = publicSectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const headerHeight =
      document.getElementById("site-header")?.offsetHeight ?? 72;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const target = visible[0]?.target;
        if (target?.id) {
          setActiveHash(`#${target.id}`);
        }
      },
      {
        rootMargin: `-${headerHeight}px 0px -55% 0px`,
        threshold: [0, 0.15, 0.35, 0.55],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const closeMenu = () => setMobileOpen(false);
    window.addEventListener("scroll", closeMenu, { passive: true });
    return () => window.removeEventListener("scroll", closeMenu);
  }, []);

  const isActive = (href: string) => activeHash === href;

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    setActiveHash(href);
    setMobileOpen(false);
    scrollToPublicSection(href);
  };

  return (
    <header
      id="site-header"
      className="sticky top-0 z-50 border-b border-gold/10 bg-[#050505]/95 backdrop-blur-md"
    >
      <div className="public-container public-header-shell mx-auto px-5 sm:px-6">
        <div className="public-header-bar flex h-16 items-center justify-between lg:grid lg:h-[72px] lg:grid-cols-[1fr_auto_1fr] lg:gap-4">
          <GoldAppLogo size="header" showTagline href="/#home" />

          <nav
            className="hidden items-center justify-center gap-3 lg:flex xl:gap-5"
            aria-label="Үндсэн цэс"
          >
            {publicNavSections.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(event) => handleNavClick(event, item.href)}
                className={`whitespace-nowrap text-[13px] font-medium transition-colors xl:text-sm ${
                  isActive(item.href)
                    ? "text-gold-light"
                    : "text-zinc-300 hover:text-gold-light"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="public-header-actions flex shrink-0 items-center justify-end lg:justify-end">
            <Link
              href="/login"
              className="hidden rounded-full border border-gold-light px-5 py-2 text-sm font-semibold text-gold-light transition hover:bg-gold/10 lg:inline-flex xl:px-6"
            >
              Нэвтрэх
            </Link>
            <button
              type="button"
              className="public-header-menu-btn inline-flex items-center justify-center rounded-lg p-2 text-zinc-400 hover:text-white lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Цэс"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-gold/10 bg-[#050505] px-4 py-4 lg:hidden"
          aria-label="Гар утасны цэс"
        >
          <div className="flex flex-col gap-1">
            {publicNavSections.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(event) => handleNavClick(event, item.href)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-gold/10 text-gold-light"
                    : "text-zinc-400 hover:bg-gold/5 hover:text-gold-light"
                }`}
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-full border border-gold-light px-3 py-2.5 text-center text-sm font-semibold text-gold-light"
            >
              Нэвтрэх
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
