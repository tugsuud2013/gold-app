/** One-page landing section anchors — header & footer nav */
export const publicNavSections = [
  { href: "#home", label: "Нүүр" },
  { href: "#about", label: "GoldApp" },
  { href: "#features", label: "Боломж" },
  { href: "#how-it-works", label: "Ашиглах" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Холбоо барих" },
] as const;

export const publicSectionIds = publicNavSections.map((item) => item.href.slice(1));

export function scrollToPublicSection(hash: string) {
  if (typeof window === "undefined") return;
  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  window.history.replaceState(null, "", `#${id}`);
}
