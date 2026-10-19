"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import type { DownloadView } from "@/lib/data";
import { formatBytes } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import copy from "@/content/copy.json";

export function DownloadList({
  items,
}: {
  items: DownloadView[];
}) {
  const [pending, setPending] = useState<DownloadView | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", company: "" });
  const [submitting, setSubmitting] = useState(false);

  function startDownload(item: DownloadView) {
    const url = `/api/download/${item.slug}`;
    window.open(url, "_blank", "noopener");
    toast.success(`${copy.downloads.downloadNow}: ${item.title}`);
  }

  async function submitGate(event: React.FormEvent) {
    event.preventDefault();
    if (!pending) return;
    if (!form.name.trim() || (!form.phone.trim() && !form.email.trim())) {
      toast.error("请填写姓名与至少一种联系方式");
      return;
    }
    setSubmitting(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          service: pending.title,
          message: `请求下载资料：${pending.title}`,
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
      <ul className="divide-y divide-border border-y border-border">
        {items.map((item, i) => (
          <li key={item.slug} className="reveal flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:gap-8">
            <span className="hidden w-8 text-sm text-muted-foreground tabular-nums sm:block">{String(i + 1).padStart(2, "0")}</span>

            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-border text-primary-text">
              <FileText className="size-5" strokeWidth={1.4} />
            </span>

            <div className="min-w-0 flex-1">
              <h3 className="title-3 text-lg">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-7 text-muted-foreground">{item.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <Badge variant="tag" size="default">
                  {item.fileType}
                </Badge>
                <span className="tabular-nums">{formatBytes(item.fileSize)}</span>
                {item.version ? (
                  <span>
                    {copy.common.version} {item.version}
                  </span>
                ) : null}
                {typeof item.downloadCount === "number" && item.downloadCount > 0 ? (
                  <span className="tabular-nums">
                    {item.downloadCount} {copy.common.downloads}
                  </span>
                ) : null}
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              shape="pill"
              onClick={() => (item.requiresForm ? setPending(item) : startDownload(item))}
              className="shrink-0 self-start sm:self-auto"
            >
              <Download />
              {copy.downloads.downloadNow}
            </Button>
          </li>
        ))}
      </ul>

      <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.downloads.requestTitle}</DialogTitle>
            <DialogDescription>{copy.downloads.requestDesc}</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <form onSubmit={submitGate} className="space-y-4">
              <div>
                <Label htmlFor="dl-name">
                  {copy.contact.fields.name} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dl-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={copy.contact.fields.namePlaceholder}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="dl-phone">{copy.contact.fields.phone}</Label>
                  <Input
                    id="dl-phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder={copy.contact.fields.phonePlaceholder}
                  />
                </div>
                <div>
                  <Label htmlFor="dl-email">{copy.contact.fields.email}</Label>
                  <Input
                    id="dl-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder={copy.contact.fields.emailPlaceholder}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dl-company">{copy.contact.fields.company}</Label>
                <Input
                  id="dl-company"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder={copy.contact.fields.companyPlaceholder}
                />
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" shape="pill" onClick={() => setPending(null)}>
                  {copy.admin.cancel}
                </Button>
                <Button type="submit" shape="pill" disabled={submitting}>
                  <Download />
                  {copy.downloads.downloadNow}
                </Button>
              </DialogFooter>
            </form>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
}
