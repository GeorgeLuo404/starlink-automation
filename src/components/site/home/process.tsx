import type { Dictionary, Locale } from "@/lib/i18n";
import { processSteps } from "@/content/defaults";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";

export function HomeProcess({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.process;
  return (
    <section className="section-y relative overflow-hidden bg-[#0a0b0e]">
      <div className="container-x relative">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} description={t.desc} />

        <div className="relative mt-16">
          <div className="hairline absolute top-[26px] right-0 left-0 hidden lg:block" aria-hidden="true" />
          <Stagger className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-6" gap={0.09}>
            {processSteps.map((step) => (
              <StaggerItem key={step.no} className="group">
                <div className="relative">
                  <span className="relative z-10 inline-flex size-[52px] items-center justify-center rounded-full border border-[#1b1f27] bg-[#08090b] font-mono text-xs tracking-widest text-[#8a929e] transition-colors duration-300 group-hover:border-[#22e0ff]/50 group-hover:text-[#22e0ff]">
                    {step.no}
                  </span>
                  <h3 className="mt-6 text-base font-semibold text-white">{step.title[locale]}</h3>
                  <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-[#8a929e]">{step.desc[locale]}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
