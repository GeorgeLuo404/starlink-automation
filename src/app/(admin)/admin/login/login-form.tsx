"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2, LogIn } from "lucide-react";
import { loginAction, type LoginState } from "@/lib/admin-actions";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import copy from "@/content/copy.json";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, { error: null });

  return (
    // `relative` keeps the form above the page's decorative layers in paint order
    <div className="relative w-full max-w-sm">
      <div className="flex flex-col items-center text-center">
        <Logo size="lg" />
        <h1 className="mt-8 text-xl font-semibold tracking-tight text-white">{copy.admin.login}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.admin.loginDesc}</p>
      </div>

      <form action={formAction} className="mt-9 space-y-5">
        <div>
          <Label htmlFor="email">{copy.admin.email}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            // Prefilled with the seeded admin (.env.example) in development only:
            // the public login page must not reveal the account.
            defaultValue={process.env.NODE_ENV !== "production" ? "admin@starlink-auto.com" : undefined}
            placeholder="name@example.com"
          />
        </div>

        <div>
          <Label htmlFor="password">{copy.admin.password}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </div>

        {state.error ? (
          <div className="flex items-start gap-2.5 rounded-(--radius) border border-destructive/30 bg-destructive/6 p-3.5">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive-soft">
              {state.error === "invalid" ? copy.admin.invalidCredentials : state.error}
            </p>
          </div>
        ) : null}

        <Button type="submit" disabled={pending} className="h-11 w-full">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {copy.admin.signingIn}
            </>
          ) : (
            <>
              <LogIn className="size-4" />
              {copy.admin.signIn}
            </>
          )}
        </Button>
      </form>

      <p className="mt-8 text-center font-mono text-[0.625rem] leading-relaxed tracking-wide text-ghost">
        {copy.meta.siteName}
      </p>
    </div>
  );
}
