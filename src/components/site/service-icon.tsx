import {
  BatteryCharging,
  Bot,
  Cpu,
  Flame,
  Ruler,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Cpu,
  Bot,
  Ruler,
  BatteryCharging,
  Flame,
};

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Cpu;
  return <Icon className={className} strokeWidth={1.4} />;
}
