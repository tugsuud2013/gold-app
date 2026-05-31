import { ChevronRight } from "lucide-react";

type FaqItem = { q: string; a: string };

export default function FaqAccordion({
  items,
  defaultOpen = -1,
}: {
  items: FaqItem[];
  defaultOpen?: number;
}) {
  return (
    <div className="public-faq-column">
      {items.map((item, index) => (
        <details
          key={item.q}
          className="public-faq-item group"
          open={index === defaultOpen}
        >
          <summary className="public-faq-summary cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <span className="public-faq-question">{item.q}</span>
            <ChevronRight
              size={18}
              className="public-faq-chevron shrink-0 text-gold-light transition-transform duration-200 group-open:rotate-90"
            />
          </summary>
          <div className="public-faq-answer">
            <p>{item.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
