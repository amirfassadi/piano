import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "دانلود نت پیانو با صدا و ابزار تمرین | نُت‌ایران",
  description: "نت پیانو آهنگ‌های ایرانی، کلاسیک و موسیقی فیلم را پیدا کنید؛ صفحهٔ اول را رایگان ببینید و اجرای نمونه را بشنوید.",
  applicationName: "نت‌ایران",
  keywords: ["نت پیانو", "نت فارسی", "نت موسیقی", "پیانو"],
};

export const viewport: Viewport = {
  themeColor: "#a5d4e5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
