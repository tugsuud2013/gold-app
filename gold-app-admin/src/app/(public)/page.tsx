/**
 * Home landing — layout per /reference/home-mockup.png
 * Section order: Hero → About → Features → How it works → FAQ → CTA
 */
import type { Metadata } from "next";
import Image from "next/image";
import {
  Check,
  ChevronRight,
  Download,
  FileText,
  LineChart,
  MessageSquare,
  Newspaper,
  Shield,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  UserPlus,
  Briefcase,
} from "lucide-react";
import FaqAccordion from "@/components/public/FaqAccordion";
import HeroPromoVisual from "@/components/public/HeroPromoVisual";
import HeroStatCards from "@/components/public/HeroStatCards";
import HeroStatCardsAnimated from "@/components/public/HeroStatCardsAnimated";
import HomeCtaVisual from "@/components/public/HomeCtaVisual";
import HomeStoreButtons from "@/components/public/HomeStoreButtons";
import GoalCardFloatingStars from "@/components/public/GoalCardFloatingStars";

export const metadata: Metadata = {
  title: "GoldApp — Алтны хөрөнгө оруулалтын платформ",
  description: "GoldApp — алт худалдан авах, зарах, ханшийг хянах нэг дорх платформ.",
};

const trustItems = [
  {
    icon: ShieldCheck,
    title: "KYC баталгаажуулалт",
    subtitle: "Хувийн мэдээлэл аюулгүй",
  },
  {
    icon: "qpay" as const,
    title: "QPay төлбөр",
    subtitle: "Хурдан, найдвартай",
  },
  {
    icon: FileText,
    title: "Цахим гэрээ",
    subtitle: "Хуулийн хүчинтэй",
  },
];

const features = [
  {
    icon: TrendingUp,
    title: "Алтны ханш",
    description: "Олон улсын зах зээлийн алтны ханшийг бодит цаг хугацаанд хянаарай.",
  },
  {
    icon: ShoppingCart,
    title: "Худалдаа авах & Зарах",
    description: "Алтыг хялбар, хурдан худалдан авч, зарах боломжтой.",
  },
  {
    icon: Briefcase,
    title: "Портфолио",
    description: "Өөрийн алтны хөрөнгө, гүйлгээний түүхийг нэг дороос удирдаарай.",
  },
  {
    icon: Newspaper,
    title: "Мэдээ мэдээлэл",
    description: "Алтны зах зээлийн сүүлийн үеийн мэдээ, шинжилгээг хүлээн аваарай.",
  },
  {
    icon: MessageSquare,
    title: "Чат дэмжлэг",
    description: "Асуултаа шууд асууж, мэргэжлийн багийн туслалцааг аваарай.",
  },
  {
    icon: Shield,
    title: "Аюулгүй байдал",
    description: "KYC баталгаажуулалт, шифрлэлтээр хамгаалагдсан данс.",
  },
];

const steps = [
  {
    step: "01",
    icon: Download,
    title: "Апп татах, суулгах",
    description: "GoldApp-ийг App Store, Google Play-ээс татаж суулгана.",
  },
  {
    step: "02",
    icon: UserPlus,
    title: "Бүртгүүлэх",
    description: "Утасны дугаараар бүртгүүлж, KYC баталгаажуулалтаа хий.",
  },
  {
    step: "03",
    icon: Briefcase,
    title: "Алт худалдаж авах",
    description: "QPay-ээр төлбөрөө хийгээд, алт худалдан авч эзэмш.",
  },
  {
    step: "04",
    icon: LineChart,
    title: "Хянах & Үржүүлэх",
    description: "Портфолиогоо хянаж, хөрөнгө өсгөх, ашиг хүртэнэ.",
  },
];

const faqs = [
  {
    q: "GoldApp гэж юу вэ?",
    a: "GoldApp нь алтны хөрөнгө оруулалтыг цахимаар хялбар болгох мобайл платформ юм. Алт худалдан авах, зарах, ханшийн мэдээлэл харах боломжийг нэг дор олгодог.",
  },
  {
    q: "Алт хэрхэн авах вэ?",
    a: "Апп дээр бүртгүүлж, KYC баталгаажуулалтыг дуусгасны дараа \"Худалдан авах\" хэсэг рүү орж, хэмжээгээ сонгоод QPay-ээр төлбөр төлнө.",
  },
  {
    q: "Хэрхэн бүртгүүлэх вэ?",
    a: "GoldApp-ийг татаж суулгаад, утасны дугаар болон нууц үгээ оруулж бүртгэл үүсгэнэ. Дараа нь KYC баталгаажуулалтыг гүйцэтгэнэ.",
  },
  {
    q: "QPay төлбөр хэрхэн хийгдэх вэ?",
    a: "Алт худалдан авах үед QPay QR код эсвэл апп-аар төлбөр хийх боломжтой. Төлбөр баталгаажсаны дараа гүйлгээ автоматаар бүртгэгдэнэ.",
  },
  {
    q: "KYC баталгаажуулалт яагаад шаардлагатай вэ?",
    a: "KYC нь хэрэглэгчийн иргэний үнэмлэхийг баталгаажуулж, дансыг аюулгүй байлгах, залилангаас хамгаалах зорилготой. Алт худалдан авах өмнө заавал гүйцэтгэнэ.",
  },
  {
    q: "Гэрээний PDF татаж болох уу?",
    a: "Тийм. Апп доторх \"Гэрээтэй танилцах\" хэсгээс гэрээний PDF файлыг үзэж, татаж авах боломжтой.",
  },
];

const aboutBullets = [
  "Бодит цагийн алтны ханш",
  "Худалдаа хийх, авах, зарах",
  "KYC баталгаажуулалттай аюулгүй данс",
];

export default function HomePage() {
  const faqLeft = [faqs[0], faqs[2], faqs[4]];
  const faqRight = [faqs[1], faqs[3], faqs[5]];

  return (
    <>
      {/* Hero */}
      <section id="home" className="public-hero public-section-anchor relative overflow-x-clip">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_12%_40%,_rgba(139,105,20,0.06)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_55%,_rgba(139,105,20,0.1)_0%,_transparent_45%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

        <div className="public-container relative z-10 mx-auto w-full px-4 pt-10 sm:px-6 lg:pt-12">
          <div className="public-hero-layout grid items-center gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-10">
            <div className="public-hero-copy text-center lg:col-span-4 lg:max-w-none lg:text-left">
              <h1 className="public-hero-title text-white">
                <span className="block">Алтаа</span>
                <span className="block text-gold-light">цахимаар</span>
                <span className="block">эзэмш</span>
              </h1>
              <p className="mt-5 text-lg font-normal tracking-wide text-zinc-400 sm:text-xl">
                Digital Gold. Real Value.
              </p>
              <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-zinc-300 lg:mx-0">
                Алт худалдан авах, зарах, ханшийн мэдээлэл харах, цахим түрийвчээр
                эзэмших боломжтой орчин үеийн финтек платформ.
              </p>
              <HomeStoreButtons />
            </div>

            <div className="public-hero-visual relative lg:col-span-5 lg:min-h-[520px]">
              <HeroPromoVisual />
            </div>

            <div className="hidden lg:col-span-3 lg:flex lg:translate-x-5 lg:items-center lg:justify-end">
              <HeroStatCardsAnimated />
            </div>
          </div>

          <div className="public-hero-mobile-stats lg:hidden">
            <HeroStatCards />
          </div>

          {/* Trust strip */}
          <div id="trust" className="public-section-anchor mt-10 border-t border-gold/10 pt-8 pb-8">
            <div className="public-trust-grid grid grid-cols-1 gap-7 md:grid-cols-3 md:gap-8">
              {trustItems.map((item) => {
                const Icon = typeof item.icon === "string" ? null : item.icon;
                return (
                  <div key={item.title} className="hero-trust-card flex w-full min-w-0 items-center gap-4">
                    <span className="hero-trust-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/8">
                      {Icon ? (
                        <Icon className="text-gold-light" size={22} strokeWidth={1.75} />
                      ) : (
                        <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-gold-light text-[11px] font-bold leading-none text-gold-light">
                          Q
                        </span>
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-snug text-white sm:text-[0.9375rem]">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-[0.8125rem] leading-snug text-zinc-400 sm:text-sm">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* What is GoldApp */}
      <section id="about" className="public-section public-section-about public-section-anchor border-t border-gold/10">
        <div className="public-container mx-auto px-4 sm:px-6">
          <div className="public-about-layout grid items-center gap-10 lg:grid-cols-[2fr_3fr] lg:gap-14">
            <div>
              <h2 className="public-section-title">
                GoldApp гэж <span className="text-gold-light">юу вэ?</span>
              </h2>
              <p className="about-section-copy mt-5 text-base">
                Бид алтаар баталгаажсан хөрөнгийг орчин цагийн технологитой хослуулан ил тод, хүртээмжтэй
                болгох зорилготой финтек платформ.
              </p>
              <p className="about-section-copy mt-4 text-base">
                Хувь хүн болон байгууллага алтан хөрөнгөө оруулах, өсгөх боломжийг нээнэ.
              </p>
              <ul className="mt-8 space-y-4">
                {aboutBullets.map((item) => (
                  <li key={item} className="flex items-center gap-3.5 text-base text-zinc-300">
                    <span className="about-check-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
                      <Check className="text-gold-light" size={14} strokeWidth={2.5} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="public-goal-card relative grid items-center gap-8 lg:grid-cols-[1fr_auto] lg:gap-8">
              <GoalCardFloatingStars />
              <div className="relative z-10 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-light">
                  Зорилго
                </p>
                <p className="mt-4 text-2xl font-bold leading-snug text-white lg:text-[1.75rem]">
                  Алтны хөрөнгө оруулалтыг хүн бүрт хүртээмжтэй болгох.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-gold-light/90">
                  Ил тод, үнэн, орчин үеийн технологи дээр суурилсан найдвартай платформ.
                </p>
              </div>
              <div className="public-goal-card-visual relative z-10 ml-auto mr-0 flex h-56 w-56 shrink-0 items-center justify-end justify-self-end sm:h-64 sm:w-64">
                <div className="public-goal-card-glow" aria-hidden />
                <Image
                  src="/images/goldapp-goal-g.png"
                  alt=""
                  width={280}
                  height={280}
                  className="relative z-10 h-auto w-full max-w-[240px] object-contain drop-shadow-[0_8px_28px_rgba(212,175,55,0.28)] sm:max-w-[280px]"
                  aria-hidden
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="public-section public-section-anchor border-t border-gold/10 bg-[#080808]">
        <div className="public-container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h2 className="public-section-title">
              Алтын <span className="text-gold-light">үндсэн боломжууд</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              GoldApp-ийн гол функцууд таны алтаар баталгаажсан хөрөнгийг удирдах хүчийг нэмэгдүүлнэ.
            </p>
          </div>
          <div className="public-features-grid mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="public-feature-card">
                  <span className="public-feature-icon">
                    <Icon className="public-feature-icon-glyph" size={32} strokeWidth={1.75} />
                  </span>
                  <div className="public-feature-card-body min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold leading-none text-white">{feature.title}</h3>
                      <ChevronRight
                        className="shrink-0 text-gold-light/70"
                        size={18}
                        strokeWidth={2}
                      />
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="public-section public-section-anchor border-t border-gold/10">
        <div className="public-container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h2 className="public-section-title">
              Хэрхэн <span className="text-gold-light">ажиллах вэ?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              Дөрвөн энгийн алхамаар GoldApp ашиглах боломжтой.
            </p>
          </div>

          <div className="public-timeline-steps mt-14 lg:mt-16">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="public-timeline-step">
                  <div className="public-timeline-step-leading">
                    <div className="public-timeline-icon">
                      <Icon className="public-timeline-icon-glyph" size={20} strokeWidth={2} />
                    </div>
                  </div>
                  <div className="public-timeline-step-content">
                    <span className="public-timeline-step-num">{item.step}</span>
                    <span className="public-timeline-step-connector" aria-hidden />
                    <h3 className="public-timeline-step-title">{item.title}</h3>
                    <p className="public-timeline-step-desc">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="public-section public-section-faq public-section-anchor bg-[#080808]">
        <div className="public-container mx-auto px-4 sm:px-6">
          <div className="public-faq-header">
            <h2 className="public-section-title">
              Түгээмэл <span className="text-gold-light">асуултууд</span>
            </h2>
            <a href="#faq" className="public-faq-view-all">
              Бүх FAQ харах →
            </a>
          </div>
          <div className="public-faq-grid">
            <FaqAccordion items={faqLeft} />
            <FaqAccordion items={faqRight} />
          </div>
        </div>
      </section>

      {/* CTA / Contact */}
      <section id="contact" className="public-section public-section-anchor border-t border-gold/10">
        <div className="public-container mx-auto px-4 sm:px-6">
          <div className="public-cta-banner">
            <HomeCtaVisual />
            <div className="public-cta-content">
              <div className="public-cta-copy">
                <h2 className="public-cta-title">Асуулт байна уу?</h2>
                <p className="public-cta-desc">
                  Бид таны асуултад хариулж, зөвлөгөө өгөхөд бэлэн байна.
                </p>
              </div>
              <a href="mailto:info@goldapp.mn" className="public-cta-button">
                Холбоо барих →
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
