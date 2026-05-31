"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import GoldAppLogo from "./GoldAppLogo";
import { publicNavSections, scrollToPublicSection } from "./publicNavSections";

const socialLinks = [
  { href: "https://facebook.com", label: "Facebook", icon: "facebook" as const },
  { href: "https://instagram.com", label: "Instagram", icon: "instagram" as const },
  { href: "https://youtube.com", label: "YouTube", icon: "youtube" as const },
  { href: "https://t.me", label: "Telegram", icon: "telegram" as const },
];

function FooterSocialIcon({ name }: { name: (typeof socialLinks)[number]["icon"] }) {
  switch (name) {
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" aria-hidden className="public-footer-social-icon-svg fill-current">
          <path d="M14 8.5V6.75c0-.69.56-1.25 1.25-1.25H16V3h-2.25C12.01 3 10.5 4.51 10.5 6.75V8.5H8v2.75h2.5V21h3.25v-9.75H16l.5-2.75H14z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" aria-hidden className="public-footer-social-icon-svg fill-none stroke-current stroke-[1.75]">
          <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
          <circle cx="12" cy="12" r="3.75" />
          <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" aria-hidden className="public-footer-social-icon-svg fill-current">
          <path d="M21.8 8.001a2.5 2.5 0 0 0-1.76-1.763C18.254 6 12 6 12 6s-6.254 0-8.04.238A2.5 2.5 0 0 0 2.2 8.001 26.3 26.3 0 0 0 2 12a26.3 26.3 0 0 0 .2 3.999 2.5 2.5 0 0 0 1.76 1.763C5.746 18 12 18 12 18s6.254 0 8.04-.238a2.5 2.5 0 0 0 1.76-1.763A26.3 26.3 0 0 0 22 12a26.3 26.3 0 0 0-.2-3.999zM10 15.464V8.536L16 12l-6 3.464z" />
        </svg>
      );
    case "telegram":
      return (
        <svg viewBox="0 0 24 24" aria-hidden className="public-footer-social-icon-svg fill-current">
          <path d="M21.94 4.66a1.2 1.2 0 0 0-1.24-.17L3.6 11.28a1.1 1.1 0 0 0 .08 2.05l4.43 1.47 1.68 5.12a1 1 0 0 0 1.66.42l2.52-2.58 4.74 3.51a1.2 1.2 0 0 0 1.88-.75l2.86-15.76zM9.2 14.13l7.58-4.78-5.9 5.36-.28 2.86-1.4-3.44z" />
        </svg>
      );
  }
}

export default function PublicFooter() {
  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    scrollToPublicSection(href);
  };

  return (
    <footer className="public-footer">
      <div className="public-container mx-auto px-4 sm:px-6">
        <div className="public-footer-grid">
          <div className="public-footer-brand">
            <GoldAppLogo size="footer" href="/#home" />
            <p className="public-footer-tagline">Digital Gold. Real Value.</p>
            <p className="public-footer-desc">
              Алтны хөрөнгө оруулалтын найдвартай платформ.
            </p>
          </div>

          <div className="public-footer-col public-footer-nav-col">
            <h3 className="public-footer-heading">Цэс</h3>
            <nav className="public-footer-links" aria-label="Footer цэс">
              {publicNavSections.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(event) => handleNavClick(event, item.href)}
                  className="public-footer-link"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="public-footer-col">
            <h3 className="public-footer-heading">Холбоо барих</h3>
            <ul className="public-footer-contact">
              <li>
                <a href="mailto:info@goldapp.mn" className="public-footer-contact-item">
                  <Mail size={16} className="public-footer-contact-icon" aria-hidden />
                  <span>info@goldapp.mn</span>
                </a>
              </li>
              <li>
                <a href="tel:+97670000000" className="public-footer-contact-item">
                  <Phone size={16} className="public-footer-contact-icon" aria-hidden />
                  <span>+976 7000-0000</span>
                </a>
              </li>
              <li className="public-footer-contact-item">
                <MapPin size={16} className="public-footer-contact-icon" aria-hidden />
                <span>Улаанбаатар хот, Монгол улс</span>
              </li>
            </ul>
          </div>

          <div className="public-footer-col">
            <h3 className="public-footer-heading">Биднийг дагаарай</h3>
            <div className="public-footer-social">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="public-footer-social-btn"
                >
                  <FooterSocialIcon name={social.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <p className="public-footer-copy">
          © 2026 GoldApp. Бүх эрх хуулиар хамгаалагдсан.
        </p>
      </div>
    </footer>
  );
}
