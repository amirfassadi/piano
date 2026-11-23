import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "scores", "artists", "song-requests", "subscription", "support", "start-piano", "iranian-piano-sheets", "classical-piano-sheets", "easy-piano-sheets", "free-piano-sheets", "film-piano-sheets", "instrumental-piano-sheets"];
  return paths.map((path) => ({ url: `https://notiran-recreation.vercel.app/${path}`, lastModified: new Date(), changeFrequency: "weekly", priority: path ? 0.7 : 1 }));
}
