"use client";

import { THEME_COLOR } from "@/lib/theme-color";

/**
 * Last-resort boundary for errors thrown by a root layout itself. It replaces
 * the whole document, so it renders its own <html> and stays dependency-free.
 *
 * No CSS imports on purpose: Next.js preloads this boundary's stylesheet on
 * every page, but only applies it when a layout crashes — importing globals.css
 * here made Chrome warn "preloaded but not used" on every load. Inline styles,
 * system fonts.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          textAlign: "center",
          background: THEME_COLOR,
          color: "white",
          fontFamily: '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>页面出错了 / Something went wrong</h1>
          <p style={{ marginTop: 12, fontSize: 14, opacity: 0.65 }}>请稍后重试。Please try again in a moment.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 32,
              height: 40,
              padding: "0 22px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.3)",
              background: "transparent",
              color: "inherit",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            重试 / Try again
          </button>
        </div>
      </body>
    </html>
  );
}
