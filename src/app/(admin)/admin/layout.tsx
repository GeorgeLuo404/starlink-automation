import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "管理后台 | 星链自动化",
  description: "深圳市星链自动化有限公司 内容管理后台",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#08090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="min-h-screen bg-background text-[#e8ebf0] antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
