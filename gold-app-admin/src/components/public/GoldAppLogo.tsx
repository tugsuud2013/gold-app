import Image from "next/image";
import Link from "next/link";

type Props = {
  size?: "header" | "footer" | "login" | "sidebar" | "sidebarCompact";
  href?: string | false;
  showTagline?: boolean;
};

export default function GoldAppLogo({
  size = "header",
  href = "/",
  showTagline = false,
}: Props) {
  const image = (
    <Image
      src="/images/goldapp-logo.png"
      alt="GoldApp"
      width={1024}
      height={276}
      className={
        size === "header"
          ? "h-9 w-auto sm:h-10"
          : size === "login"
            ? "login-logo-image h-auto w-full max-w-[150px]"
            : size === "sidebar"
              ? "admin-sidebar-logo h-8 w-auto max-w-[132px]"
              : size === "sidebarCompact"
                ? "admin-sidebar-logo-icon h-8 w-8 object-contain object-left"
                : "public-footer-logo h-auto w-full max-w-[150px]"
      }
      priority={size === "header" || size === "login" || size === "sidebar"}
    />
  );

  const content = (
    <span className={`inline-flex flex-col ${size === "login" ? "items-center" : ""}`}>
      {image}
      {showTagline && (size === "header" || size === "login") && (
        <span
          className={
            size === "login"
              ? "login-logo-tagline mt-2 text-sm font-normal tracking-wide text-zinc-400"
              : "mt-0.5 text-[10px] font-normal tracking-wide text-zinc-500 sm:text-[11px]"
          }
        >
          Digital Gold. Real Value.
        </span>
      )}
    </span>
  );

  if (href === false) return content;

  return (
    <Link href={href} className="inline-flex shrink-0 items-center justify-self-start">
      {content}
    </Link>
  );
}
