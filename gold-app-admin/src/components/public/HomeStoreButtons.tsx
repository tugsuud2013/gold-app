import Image from "next/image";

const BADGE_WIDTH = 348;
const BADGE_HEIGHT = 108;

type StoreBadgeProps = {
  href?: string;
};

const badgeLinkClass =
  "inline-flex h-11 items-center justify-center overflow-hidden rounded-lg border border-white transition hover:opacity-90 hover:border-white/80";

function AppStoreBadge({ href = "#features" }: StoreBadgeProps) {
  return (
    <a
      href={href}
      className={badgeLinkClass}
      aria-label="Download on the App Store"
    >
      <Image
        src="/images/app-store-badge.png"
        alt=""
        width={BADGE_WIDTH}
        height={BADGE_HEIGHT}
        className="block h-11 w-auto max-h-11"
        priority
      />
    </a>
  );
}

function GooglePlayBadge({ href = "#features" }: StoreBadgeProps) {
  return (
    <a
      href={href}
      className={badgeLinkClass}
      aria-label="Get it on Google Play"
    >
      <Image
        src="/images/google-play-badge.png"
        alt=""
        width={BADGE_WIDTH}
        height={BADGE_HEIGHT}
        className="block h-11 w-auto max-h-11"
        priority
      />
    </a>
  );
}

export default function HomeStoreButtons() {
  return (
    <div className="public-hero-store-buttons mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-3.5 lg:justify-start">
      <AppStoreBadge />
      <GooglePlayBadge />
    </div>
  );
}
