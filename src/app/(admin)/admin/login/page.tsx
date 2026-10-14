import { Suspense } from "react";
import { getDictionary } from "@/lib/i18n";
import { defaultLocale } from "@/lib/i18n/config";
import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  const dict = getDictionary(defaultLocale);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-16">
      <div className="grid-blueprint absolute inset-0 opacity-40" aria-hidden="true" />
      <div
        className="absolute -top-40 left-1/2 h-80 w-xl -translate-x-1/2 rounded-full bg-primary/8 blur-[110px]"
        aria-hidden="true"
      />
      <Suspense fallback={null}>
        <LoginForm dict={dict} />
      </Suspense>
    </div>
  );
}
