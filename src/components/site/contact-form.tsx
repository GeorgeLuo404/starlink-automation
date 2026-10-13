"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Fields = { name: string; company: string; phone: string; email: string; service: string; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\-\s\d]{6,20}$/;

export function ContactForm({
  locale,
  dict,
  services,
  variant = "page",
}: {
  locale: Locale;
  dict: Dictionary;
  services: string[];
  variant?: "page" | "inline";
}) {
  const t = dict.contact;
  const v = t.validation;
  const [fields, setFields] = useState<Fields>({
    name: "",
    company: "",
    phone: "",
    email: "",
    service: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  function update<K extends keyof Fields>(key: K, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof Fields, string>> = {};
    if (!fields.name.trim()) next.name = v.nameRequired;
    if (!fields.phone.trim() && !fields.email.trim()) {
      next.phone = v.contactRequired;
      next.email = v.contactRequired;
    } else {
      if (fields.phone.trim() && !PHONE_RE.test(fields.phone.trim())) next.phone = v.phoneInvalid;
      if (fields.email.trim() && !EMAIL_RE.test(fields.email.trim())) next.email = v.emailInvalid;
    }
    if (!fields.message.trim()) next.message = v.messageRequired;
    else if (fields.message.trim().length < 10) next.message = v.messageShort;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setState("loading");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, locale, source: "contact" }),
      });
      if (!response.ok) throw new Error("request failed");
      setState("success");
      setFields({ name: "", company: "", phone: "", email: "", service: "", message: "" });
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-(--radius) border border-success/30 bg-success/6 px-6 py-14 text-center",
          variant === "inline" && "py-10"
        )}
      >
        <CheckCircle2 className="size-10 text-success" strokeWidth={1.5} />
        <h3 className="mt-5 text-lg font-semibold text-white">{t.successTitle}</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{t.successDesc}</p>
        <button type="button" onClick={() => setState("idle")} className="btn btn-ghost mt-6 h-10 px-4">
          {t.formTitle}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="cf-name">
            {t.fields.name} <span className="text-destructive">*</span>
          </label>
          <input
            id="cf-name"
            className={cn("field", errors.name && "border-destructive/60")}
            value={fields.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder={t.fields.namePlaceholder}
            autoComplete="name"
          />
          {errors.name ? <p className="mt-1.5 text-xs text-destructive">{errors.name}</p> : null}
        </div>

        <div>
          <label className="field-label" htmlFor="cf-company">
            {t.fields.company}
          </label>
          <input
            id="cf-company"
            className="field"
            value={fields.company}
            onChange={(e) => update("company", e.target.value)}
            placeholder={t.fields.companyPlaceholder}
            autoComplete="organization"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="cf-phone">
            {t.fields.phone}
          </label>
          <input
            id="cf-phone"
            className={cn("field", errors.phone && "border-destructive/60")}
            value={fields.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder={t.fields.phonePlaceholder}
            autoComplete="tel"
            inputMode="tel"
          />
          {errors.phone ? <p className="mt-1.5 text-xs text-destructive">{errors.phone}</p> : null}
        </div>

        <div>
          <label className="field-label" htmlFor="cf-email">
            {t.fields.email}
          </label>
          <input
            id="cf-email"
            className={cn("field", errors.email && "border-destructive/60")}
            value={fields.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder={t.fields.emailPlaceholder}
            autoComplete="email"
            inputMode="email"
          />
          {errors.email ? <p className="mt-1.5 text-xs text-destructive">{errors.email}</p> : null}
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="cf-service">
          {t.fields.service}
        </label>
        <div className="relative">
          <select
            id="cf-service"
            className="field appearance-none pr-9"
            value={fields.service}
            onChange={(e) => update("service", e.target.value)}
          >
            <option value="">{t.fields.servicePlaceholder}</option>
            {services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
          <ArrowRight className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 rotate-90 text-muted-foreground" />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="cf-message">
          {t.fields.message} <span className="text-destructive">*</span>
        </label>
        <textarea
          id="cf-message"
          rows={6}
          className={cn("field resize-y", errors.message && "border-destructive/60")}
          value={fields.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder={t.fields.messagePlaceholder}
        />
        {errors.message ? <p className="mt-1.5 text-xs text-destructive">{errors.message}</p> : null}
      </div>

      {state === "error" ? (
        <div className="rounded-(--radius) border border-destructive/30 bg-destructive/6 p-4">
          <p className="text-sm font-medium text-[#ff8a8c]">{t.errorTitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t.errorDesc}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button type="submit" disabled={state === "loading"} className="btn btn-primary h-12 px-6">
          {state === "loading" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t.submitting}
            </>
          ) : (
            <>
              {t.submit}
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
        <p className="text-xs text-[#5c6472]">{dict.home.cta.note}</p>
      </div>
    </form>
  );
}
