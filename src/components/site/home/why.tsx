import { getPageContent } from "@/lib/page-content";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionHead } from "../kit";

/**
 * 选择理由 — the heading beside a list of the reasons. Each row shows its
 * title; the round + button opens it to the explanation (one at a time).
 * Text from 后台 → 首页 → 选择理由.
 */
export async function HomeWhy() {
  const t = await getPageContent("home.why");
  const items = t.items.map((item, i) => ({ ...item, no: String(i + 1).padStart(2, "0") }));
  return (
    <section className="theme-white section-y">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHead eyebrow={t.eyebrow} title={t.title} className="lg:sticky lg:top-28" />
        </div>

        <Accordion type="single" collapsible defaultValue={items[0]?.no} className="reveal border-t border-border lg:col-span-7">
          {items.map((item) => (
            <AccordionItem key={item.no} value={item.no} className="last:border-b">
              <AccordionTrigger indicator={<PlusMinus />} className="gap-6 py-6 text-base font-normal lg:py-7">
                <span className="flex items-baseline gap-5">
                  <span className="w-6 shrink-0 text-sm text-primary-text tabular-nums">{item.no}</span>
                  <span className="text-lg font-medium transition-colors sm:text-xl lg:text-[1.375rem]">{item.title}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-7 pl-11 lg:pb-8">
                <p className="max-w-xl text-[0.9375rem] leading-7 text-muted-foreground">{item.desc}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/** + that folds into − when its row is open; fills with the accent while open. */
function PlusMinus() {
  return (
    <span
      aria-hidden="true"
      className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors duration-300 group-hover:border-foreground/40 group-data-[state=open]:border-primary group-data-[state=open]:bg-primary group-data-[state=open]:text-primary-foreground"
    >
      <span className="absolute h-[1.5px] w-3.5 rounded-full bg-current" />
      <span className="absolute h-3.5 w-[1.5px] rounded-full bg-current transition-transform duration-300 group-data-[state=open]:scale-y-0" />
    </span>
  );
}
