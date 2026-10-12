import { cn } from "@/lib/utils";

/**
 * 星链自动化品牌标识 / Starlink Automation brand mark
 * A hexagonal "constellation" node — industrial, technical, and scalable.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <path
        d="M20 2.5 34.5 11v18L20 37.5 5.5 29V11L20 2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        className="text-[#22e0ff]"
      />
      <path d="M20 2.5 34.5 11v18L20 37.5 5.5 29V11L20 2.5Z" fill="url(#sl-glow)" opacity="0.5" />
      <circle cx="20" cy="20" r="2.6" fill="#22e0ff" />
      <circle cx="20" cy="9" r="1.9" fill="#e8ebf0" />
      <circle cx="30" cy="26" r="1.9" fill="#e8ebf0" />
      <circle cx="10" cy="26" r="1.9" fill="#e8ebf0" />
      <path d="M20 20 20 9M20 20 30 26M20 20 10 26" stroke="#22e0ff" strokeWidth="1" opacity="0.75" />
      <defs>
        <radialGradient id="sl-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#22e0ff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#22e0ff" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function Logo({
  className,
  showWordmark = true,
  size = "md",
}: {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const dims = { sm: "size-7", md: "size-9", lg: "size-12" };
  const title = { sm: "text-[0.9rem]", md: "text-[1.02rem]", lg: "text-xl" };
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={cn(dims[size], "shrink-0")} />
      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span className={cn("font-semibold tracking-tight text-white", title[size])}>星链自动化</span>
          <span className="mt-1 font-mono text-[0.5rem] tracking-[0.28em] text-[#8a929e] uppercase">
            Starlink Automation
          </span>
        </span>
      ) : null}
    </span>
  );
}
