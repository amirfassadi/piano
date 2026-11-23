import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: {
    default: "NUANCE — Piano Scores, Chosen with Care",
    template: "%s · NUANCE",
  },
  description: "An editorial piano-score library for curious players. Find familiar melodies, explore composers, and hear a short preview.",
  applicationName: "NUANCE",
  keywords: ["piano scores", "sheet music", "piano", "classical music", "نت پیانو", "نت موسیقی"],
};

export const viewport: Viewport = {
  themeColor: "#6A2638",
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
