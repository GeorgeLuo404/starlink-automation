import { ArrowRight } from "lucide-react";
import { ctaRobot } from "@/lib/line-art/drawings";
import { Card } from "@/components/ui/card";
import { Eyebrow, PillLink } from "./kit";
import { LineArt } from "./line-art";
import { getPageContent } from "@/lib/page-content";

/** 开始合作 — the white card that closes the home page and most inner pages. Text from 后台 → 首页 → 行动号召. */
export async function CtaSection() {
  const t = await getPageContent("home.cta");
  return (
    <section className="theme-dark py-20 lg:py-28">
      <div className="container-x">
        <Card className="theme-white reveal grid items-center gap-10 overflow-hidden rounded-4xl border-0 bg-background p-8 md:p-14 lg:grid-cols-2 lg:p-20">
          <div>
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <h2 className="title-2 mt-6">{t.title}</h2>
            <p className="lead mt-6 max-w-md">{t.desc}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <PillLink href="/contact">
                {t.primary}
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </PillLink>
              <PillLink href="/downloads" variant="outline">
                {t.secondary}
              </PillLink>
            </div>
            {t.note ? <p className="mt-8 text-xs text-muted-foreground">{t.note}</p> : null}
          </div>
          <LineArt drawing={ctaRobot()} className="text-foreground" />
        </Card>
      </div>
    </section>
  );
}
