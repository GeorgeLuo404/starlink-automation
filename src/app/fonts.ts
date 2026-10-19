import localFont from "next/font/local";

/**
 * 自托管字体 / Self-hosted fonts.
 *
 * 不用 next/font/google：构建时要访问 Google Fonts，在国内服务器上会失败。
 * 这里只含拉丁字符；中文由 @fontsource-variable/noto-sans-sc 提供（站点布局中引入，
 * 按 unicode-range 切片自托管），之后才回退到系统字体（PingFang SC / 微软雅黑 …）。
 * Latin-only variable fonts; CJK comes from the self-hosted Noto Sans SC
 * imported in the site layout, then the system fonts in --font-sans.
 */
export const inter = localFont({
  src: "./fonts/inter-latin-var.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});

export const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-latin-var.woff2",
  weight: "100 800",
  variable: "--font-jetbrains-mono",
  display: "swap",
});

/** Put on <html> so --font-sans / --font-mono in globals.css can resolve them. */
export const fontVariables = `${inter.variable} ${jetbrainsMono.variable}`;
