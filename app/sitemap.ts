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
  "practice/nuance-sample",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configuredUrl) return [];
  let baseUrl: string;
  try {
    const url = new URL(configuredUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") return [];
    baseUrl = url.origin;
  } catch {
    return [];
  }
  const paths = [...staticPaths, ...scores.map((score) => `sheet/${score.slug}`)];
  return paths.map((path) => ({
    url: `${baseUrl}/${path}`,
    lastModified: new Date(),
    changeFrequency: path ? "weekly" : "monthly",
    priority: path ? 0.7 : 1,
  }));
}
