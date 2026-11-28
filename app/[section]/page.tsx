import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionPage } from "@/components/collection-page";
import { scores } from "@/lib/catalog";
import { matchesDifficulty } from "@/lib/catalog-filters";
import { canonicalUrl } from "@/lib/seo";

export const dynamicParams = false;

const sections = ["scores", "artists", "song-requests", "subscription", "support", "feedback", "start-piano", "iranian-piano-sheets", "classical-piano-sheets", "easy-piano-sheets", "free-piano-sheets", "film-piano-sheets", "instrumental-piano-sheets", "account", "settings", "payments"];

export function generateStaticParams() {
  return sections.map((section) => ({ section }));
}

const sectionTitles: Record<string, string> = {
  scores: "Piano Scores",
  artists: "Artists in the Piano Library",
  "song-requests": "Score Requests",
  subscription: "Membership Information",
  support: "Support",
  feedback: "Feedback",
  "start-piano": "Getting Started with Piano",
  "iranian-piano-sheets": "Iranian Piano Scores",
  "classical-piano-sheets": "Classical Piano Scores",
  "easy-piano-sheets": "Easy Piano Scores",
  "free-piano-sheets": "Free Piano Scores",
  "film-piano-sheets": "Film Piano Scores",
  "instrumental-piano-sheets": "Instrumental Piano Scores",
  account: "Account",
  settings: "Settings",
  payments: "Payments",
};

const sectionCategories: Record<string, string> = {
  "iranian-piano-sheets": "ترانه‌های ایرانی",
  "classical-piano-sheets": "کلاسیک",
  "film-piano-sheets": "موسیقی فیلم",
  "instrumental-piano-sheets": "بی‌کلام",
};

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  const title = sectionTitles[section];
  if (!title) return {};
  const category = sectionCategories[section];
  const count = category
    ? scores.filter((score) => score.category === category).length
    : section === "easy-piano-sheets"
      ? scores.filter((score) => matchesDifficulty(score.level, "آسان")).length
      : section === "free-piano-sheets"
        ? scores.filter((score) => score.free).length
        : section === "scores" ? scores.length : undefined;
  const description = count === undefined
    ? `${title} at NUANCE, a piano-score library.`
    : `${title}: ${count} ${count === 1 ? "score" : "scores"} currently listed in the local catalog.`;
  const canonical = canonicalUrl(`/${section}`);
  return { title, description, ...(canonical ? { alternates: { canonical } } : {}) };
}

export default async function SectionRoute({ params, searchParams }: { params: Promise<{ section: string }>; searchParams: Promise<{ q?: string; category?: string; difficulty?: string; saved?: string }> }) {
  const [{ section }, { q = "", category = "", difficulty = "", saved = "" }] = await Promise.all([params, searchParams]);
  if (!sections.includes(section)) notFound();
  return <CollectionPage key={`${section}|${q}|${category}|${difficulty}|${saved}`} section={section} initialQuery={q} initialCategory={category} initialDifficulty={difficulty} initialSaved={saved === "1"} />;
}
