/** Gold nuggets decorative layer — CTA card right / mobile background */
export default function HomeCtaVisual() {
  return (
    <div className="public-cta-visual" aria-hidden>
      {/* Native img avoids Next.js image optimizer cache */}
      <img
        src="/images/cta-gold-nuggets-v3.png"
        alt=""
        className="public-cta-visual-image"
        decoding="async"
        loading="lazy"
        fetchPriority="low"
      />
      <div className="public-cta-visual-fade" />
    </div>
  );
}
