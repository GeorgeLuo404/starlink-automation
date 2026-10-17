"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { DownloadView } from "@/lib/data";
import { formatBytes, cn } from "@/lib/utils";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DownloadList({
  items,
  locale,
  dict,
}: {
  items: DownloadView[];
  locale: Locale;
  dict: Dictionary;
}) {
  const [pending, setPending] = useState<DownloadView | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", company: "" });
  const [submitting, setSubmitting] = useState(false);

  function startDownload(item: DownloadView) {
    const url = `/api/download/${item.slug}`;
    window.open(url, "_blank", "noopener");
    toast.success(`${dict.downloads.downloadNow}: ${item.title[locale]}`);
  }

  async function submitGate(event: React.FormEvent) {
    event.preventDefault();
    if (!pending) return;
    if (!form.name.trim() || (!form.phone.trim() && !form.email.trim())) {
      toast.error(locale === "zh" ? "请填写姓名与至少一种联系方式" : "Name and one contact method are required");
      return;
    }
    setSubmitting(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          service: pending.title.zh,
          message: locale === "zh" ? `请求下载资料：${pending.title.zh}` : `Download request: ${pending.title.en}`,
          locale,
          source: "download",
        }),
      });
    } catch {
      /* never block the download because of a network hiccup */
    }
    setSubmitting(false);
    const item = pending;
    setPending(null);
    setForm({ name: "", phone: "", email: "", company: "" });
    startDownload(item);
  }

  return (
    <>
      <div className="divide-y divide-border border-y border-border">
        {items.map((item, i) => (
          <div
            key={item.slug}
            className="group flex flex-col gap-5 py-7 transition-colors sm:flex-row sm:items-center"
          >
            <span className="font-mono text-xs tracking-widest text-ghost">
              {String(i + 1).padStart(2, "0")}
            </span>

            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-(--radius) border border-border bg-card text-primary">
              <FileText className="size-5" strokeWidth={1.5} />
            </span>

            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-white transition-colors group-hover:text-primary">
                {item.title[locale]}
              </h3>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
                {item.description[locale]}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono text-[0.625rem] tracking-wider text-faint">
                <span className="text-primary">{item.fileType}</span>
                <span>{formatBytes(item.fileSize)}</span>
                {item.version ? (
                  <span>
                    {dict.common.version} {item.version}
                  </span>
                ) : null}
                {typeof item.downloadCount === "number" && item.downloadCount > 0 ? (
                  <span>
                    {item.downloadCount} {dict.common.downloads}
                  </span>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={() => startDownload(item)}
              className="btn btn-ghost h-10 shrink-0 self-start px-4 sm:self-auto"
            >
              <Download className="size-4" />
              {dict.downloads.downloadNow}
            </button>
          </div>
        ))}
      </div>

      <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dict.downloads.requestTitle}</DialogTitle>
            <DialogDescription>{dict.downloads.requestDesc}</DialogDescription>
          </DialogHeader>
          <DialogBody>
        <form onSubmit={submitGate} className="space-y-4">
          <div>
            <Label htmlFor="dl-name">
              {dict.contact.fields.name} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dl-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={dict.contact.fields.namePlaceholder}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="dl-phone">{dict.contact.fields.phone}</Label>
              <Input
                id="dl-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder={dict.contact.fields.phonePlaceholder}
              />
            </div>
            <div>
              <Label htmlFor="dl-email">{dict.contact.fields.email}</Label>
              <Input
                id="dl-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={dict.contact.fields.emailPlaceholder}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="dl-company">{dict.contact.fields.company}</Label>
            <Input
              id="dl-company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder={dict.contact.fields.companyPlaceholder}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setPending(null)} className="btn btn-ghost h-10 px-4">
              {dict.admin.cancel}
            </button>
            <button type="submit" disabled={submitting} className={cn("btn btn-primary h-10 px-5")}>
              <Download className="size-4" />
              {dict.downloads.downloadNow}
            </button>
          </div>
        </form>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
}
