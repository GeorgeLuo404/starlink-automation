import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center md:text-center",
        className
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#22e0ff]" />
              <span className="text-eyebrow text-[#22e0ff]">{eyebrow}</span>
            </div>
          </Reveal>
        ) : null}
        <Reveal delay={0.06}>
          <h2 className="text-display mt-5 text-3xl text-white sm:text-4xl md:text-[2.75rem]">{title}</h2>
        </Reveal>
        {description ? (
          <Reveal delay={0.12}>
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-[#8a929e]">{description}</p>
          </Reveal>
        ) : null}
      </div>
      {action ? <Reveal delay={0.16}>{action}</Reveal> : null}
    </div>
  );
}
