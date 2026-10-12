import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { listServices } from "@/lib/data";
import { localeHref } from "@/components/site/nav-items";
import { ServiceIcon } from "@/components/site/service-icon";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal, Stagger, StaggerItem, TiltCard } from "@/components/motion";

export async function HomeServices({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const services = await listServices();
  const t = dict.home.services;

  return (
    <section className="section-y relative" id="capabilities">
      <div className="container-x">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} description={t.desc} />

        <Stagger className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius)] border border-[#1b1f27] bg-[#1b1f27] sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <StaggerItem key={service.slug} className="bg-[#0a0b0e]">
              <TiltCard max={3}>
                <Link
                  href={localeHref(locale, `/services/${service.slug}`)}
                  className="group corner-ticks relative flex h-full flex-col p-7 transition-colors hover:bg-[#0d0f13] lg:p-8"
                >
                  <div className="flex items-start justify-between">
                    <span className="inline-flex size-11 items-center justify-center rounded-[var(--radius)] border border-[#1b1f27] bg-[#0d0f13] text-[#22e0ff] transition-colors group-hover:border-[#22e0ff]/40">
                      <ServiceIcon name={service.icon} className="size-5" />
                    </span>
                    <span className="font-mono text-[0.625rem] tracking-[0.2em] text-[#3d4552]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-7 text-xl font-semibold tracking-tight text-white">{service.title[locale]}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[#8a929e]">{service.summary[locale]}</p>

                  <div className="mt-7 flex flex-wrap gap-x-4 gap-y-1.5">
                    {service.features.slice(0, 3).map((feature) => (
                      <span key={feature.zh} className="font-mono text-[0.625rem] tracking-wide text-[#5c6472]">
                        · {feature[locale]}
                      </span>
                    ))}
                  </div>

                  <span className="mt-7 inline-flex items-center gap-1.5 text-xs font-medium text-[#22e0ff] opacity-0 transition-opacity group-hover:opacity-100">
                    {dict.home.services.cta}
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </Link>
              </TiltCard>
            </StaggerItem>
          ))}

          <StaggerItem className="bg-[#0a0b0e]">
            <Reveal className="flex h-full flex-col justify-between bg-[#0d0f13] p-7 lg:p-8">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-white">{dict.nav.cta}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#8a929e]">{dict.home.cta.desc}</p>
              </div>
              <Link href={localeHref(locale, "/contact")} className="btn btn-primary mt-8 w-fit">
                {dict.home.cta.primary}
                <ArrowUpRight className="size-4" />
              </Link>
            </Reveal>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}
