import type { MetadataRoute } from "next";
import { scores } from "@/lib/catalog";

const staticPaths = [
  "",
  "scores",
  "artists",
  "song-requests",
  "subscription",
  "support",
  "feedback",
  "start-piano",
  "iranian-piano-sheets",
  "classical-piano-sheets",
  "easy-piano-sheets",
  "free-piano-sheets",
  "film-piano-sheets",
  "instrumental-piano-sheets",
  "account",
  "settings",
  "payments",
  "payments/my-scores",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelHost = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
  const origin = configuredUrl || vercelHost;
  if (!origin) return [];

  const baseUrl = origin.replace(/\/$/, "");
  const paths = [...staticPaths, ...scores.map((score) => `sheet/${score.slug}`)];
  return paths.map((path) => ({
    url: `${baseUrl}/${path}`,
    lastModified: new Date(),
    changeFrequency: path ? "weekly" : "monthly",
    priority: path ? 0.7 : 1,
  }));
}
