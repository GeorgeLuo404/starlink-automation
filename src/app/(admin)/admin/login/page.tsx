import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-16">
      {/*
        Decorative layers MUST be pointer-events-none. They are positioned, and
        positioned boxes paint above non-positioned siblings — without this they
        sit on top of the form and swallow every click. `aria-hidden` does not
        affect hit-testing.
      */}
      <div className="grid-lines grid-lines-lg pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-xl -translate-x-1/2 rounded-full bg-primary/8 blur-[110px]"
        aria-hidden="true"
      />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
