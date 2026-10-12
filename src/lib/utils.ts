import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 1234567 -> "1,234,567" */
export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatBytes(bytes: number, decimals = 1) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function formatDate(date: Date | string | null | undefined, locale = "zh-CN") {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function slugify(input: string) {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return base || `item-${Date.now().toString(36)}`;
}

export function truncate(text: string, max = 120) {
  const clean = text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

/** Pick the localized field from a bilingual record, falling back to Chinese. */
export function pick<T extends Record<string, unknown>>(row: T, field: string, locale: string): string {
  const localized = row[`${field}${locale === "en" ? "En" : "Zh"}`];
  const fallback = row[`${field}Zh`];
  return ((localized as string) || (fallback as string) || "") as string;
}
