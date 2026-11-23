import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: {
    default: "NUANCE — هر نت، یک ظرافت",
    template: "%s | NUANCE",
  },
  description: "آرشیوی گزیده از نت‌های پیانو؛ برای کشف، شنیدن و نواختن دوباره. Every Note Has a Nuance.",
  applicationName: "NUANCE",
  keywords: ["نت پیانو", "نت فارسی", "نت موسیقی", "پیانو"],
};

export const viewport: Viewport = {
  themeColor: "#f5f0e7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" data-scroll-behavior="smooth">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
