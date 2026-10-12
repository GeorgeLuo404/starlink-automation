"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2, LogIn } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import { loginAction, type LoginState } from "@/lib/admin-actions";
import { Logo } from "@/components/site/logo";

export function LoginForm({ dict }: { dict: Dictionary }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, { error: null });

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center text-center">
        <Logo size="lg" />
        <h1 className="mt-8 text-xl font-semibold tracking-tight text-white">{dict.admin.login}</h1>
        <p className="mt-2 text-sm text-[#8a929e]">{dict.admin.loginDesc}</p>
      </div>

      <form action={formAction} className="mt-9 space-y-5">
        <div>
          <label className="field-label" htmlFor="email">
            {dict.admin.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            defaultValue="admin@starlink-auto.com"
            className="field"
            placeholder="admin@starlink-auto.com"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="password">
            {dict.admin.password}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="field"
            placeholder="••••••••"
          />
        </div>

        {state.error ? (
          <div className="flex items-start gap-2.5 rounded-[var(--radius)] border border-[#ff4d4f]/30 bg-[#ff4d4f]/6 p-3.5">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-[#ff4d4f]" />
            <p className="text-sm text-[#ff8a8c]">
              {state.error === "invalid" ? dict.admin.invalidCredentials : state.error}
            </p>
          </div>
        ) : null}

        <button type="submit" disabled={pending} className="btn btn-primary h-11 w-full">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {dict.admin.signingIn}
            </>
          ) : (
            <>
              <LogIn className="size-4" />
              {dict.admin.signIn}
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center font-mono text-[0.625rem] leading-relaxed tracking-wide text-[#3d4552]">
        {dict.meta.siteName}
      </p>
    </div>
  );
}
