import { PropsWithChildren } from "react";
import PublicFooter from "@/components/public/PublicFooter";
import PublicHeader from "@/components/public/PublicHeader";
import ScrollToTop from "@/components/public/ScrollToTop";

/** Header/footer render once here only — never in page.tsx */
export default function PublicLayout({ children }: PropsWithChildren) {
  return (
    <div className="public-site w-full overflow-x-clip bg-[#050505] text-white">
      <PublicHeader />
      <main className="relative block w-full max-w-full overflow-x-clip">{children}</main>
      <PublicFooter />
      <ScrollToTop />
    </div>
  );
}
