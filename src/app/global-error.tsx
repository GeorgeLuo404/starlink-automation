"use client";

import "@/app/globals.css";

/**
 * Last-resort boundary for errors thrown by a root layout itself. It replaces
 * the whole document, so it renders its own <html> and stays dependency-free.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="flex min-h-screen items-center justify-center bg-background p-6 text-center text-foreground antialiased">
        <div>
          <h1 className="text-xl font-semibold text-white">页面出错了 / Something went wrong</h1>
          <p className="mt-3 text-sm text-muted-foreground">请稍后重试。Please try again in a moment.</p>
          <button type="button" onClick={reset} className="btn btn-primary mt-8 h-10 px-5">
            重试 / Try again
          </button>
        </div>
      </body>
    </html>
  );
}
