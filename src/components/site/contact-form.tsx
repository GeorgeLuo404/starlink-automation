"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import copy from "@/content/copy.json";

/** Plain small labels on the site (the shadcn default is the admin's mono caps). */
const label = "font-sans text-sm normal-case tracking-normal text-foreground";
const errorText = "mt-1.5 text-xs text-destructive";

type Fields = { name: string; company: string; phone: string; email: string; service: string; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\-\s\d]{6,20}$/;

export function ContactForm({
  services,
  variant = "page",
}: {
  services: string[];
  variant?: "page" | "inline";
}) {
  const t = copy.contact;
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
        body: JSON.stringify({ ...fields, source: "contact" }),
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
        <h3 className="title-3 mt-5">{t.successTitle}</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{t.successDesc}</p>
        <Button type="button" variant="outline" shape="pill" onClick={() => setState("idle")} className="mt-6">
          {t.formTitle}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label className={label} htmlFor="cf-name">
            {t.fields.name} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cf-name"
            aria-invalid={Boolean(errors.name)}
            value={fields.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder={t.fields.namePlaceholder}
            autoComplete="name"
          />
          {errors.name ? <p className={errorText}>{errors.name}</p> : null}
        </div>

        <div>
          <Label className={label} htmlFor="cf-company">
            {t.fields.company}
          </Label>
          <Input
            id="cf-company"
            value={fields.company}
            onChange={(e) => update("company", e.target.value)}
            placeholder={t.fields.companyPlaceholder}
            autoComplete="organization"
          />
        </div>

        <div>
          <Label className={label} htmlFor="cf-phone">
            {t.fields.phone}
          </Label>
          <Input
            id="cf-phone"
            aria-invalid={Boolean(errors.phone)}
            value={fields.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder={t.fields.phonePlaceholder}
            autoComplete="tel"
            inputMode="tel"
          />
          {errors.phone ? <p className={errorText}>{errors.phone}</p> : null}
        </div>

        <div>
          <Label className={label} htmlFor="cf-email">
            {t.fields.email}
          </Label>
          <Input
            id="cf-email"
            aria-invalid={Boolean(errors.email)}
            value={fields.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder={t.fields.emailPlaceholder}
            autoComplete="email"
            inputMode="email"
          />
          {errors.email ? <p className={errorText}>{errors.email}</p> : null}
        </div>
      </div>

      <div>
        <Label className={label} htmlFor="cf-service">
          {t.fields.service}
        </Label>
        <Select value={fields.service} onValueChange={(value) => update("service", value)}>
          <SelectTrigger id="cf-service">
            <SelectValue placeholder={t.fields.servicePlaceholder} />
          </SelectTrigger>
          {/* The list is portalled to <body>; give it the form's paper theme. */}
          <SelectContent className="theme-white">
            {services.map((service) => (
              <SelectItem key={service} value={service}>
                {service}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className={label} htmlFor="cf-message">
          {t.fields.message} <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="cf-message"
          rows={6}
          aria-invalid={Boolean(errors.message)}
          className="resize-y"
          value={fields.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder={t.fields.messagePlaceholder}
        />
        {errors.message ? <p className={errorText}>{errors.message}</p> : null}
      </div>

      {state === "error" ? (
        <div className="rounded-(--radius) border border-destructive/30 bg-destructive/6 p-4">
          <p className="text-sm font-medium text-destructive">{t.errorTitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t.errorDesc}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <Button type="submit" size="lg" shape="pill" disabled={state === "loading"} className="group">
          {state === "loading" ? (
            <>
              <Loader2 className="animate-spin" />
              {t.submitting}
            </>
          ) : (
            <>
              {t.submit}
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">{copy.home.cta.note}</p>
      </div>
    </form>
  );
}
