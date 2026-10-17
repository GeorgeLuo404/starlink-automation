import Script from "next/script";

/**
 * 统计脚本 / Analytics, driven by 后台 → 站点设置 → 统计代码 ID.
 *   · "G-XXXXXXX"           → Google Analytics 4
 *   · 32 位十六进制 / 32-hex → 百度统计 / Baidu Tongji
 * Anything else (or empty) loads nothing.
 */
export function Analytics({ id }: { id: string | null }) {
  if (!id) return null;

  if (/^G-[A-Z0-9]+$/i.test(id)) {
    return (
      <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config",${JSON.stringify(id)});`}
        </Script>
      </>
    );
  }

  if (/^[0-9a-f]{32}$/i.test(id)) {
    return <Script src={`https://hm.baidu.com/hm.js?${id}`} strategy="afterInteractive" />;
  }

  return null;
}
