import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScoreDetail } from "@/components/score-detail";
import { scores } from "@/lib/catalog";
import { canonicalUrl } from "@/lib/seo";

export function generateStaticParams() {
  return scores.map((score) => ({ slug: score.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const score = scores.find((item) => item.slug === slug);
  if (!score) return {};
  const credits = score.artist && score.artist !== "—" ? ` by ${score.artist}` : "";
  const description = `${score.title}${credits} — ${score.category} piano score. Difficulty: ${score.level}.`;
  const canonical = canonicalUrl(`/sheet/${score.slug}`);
  return {
    title: `${score.title} Piano Score`,
    description,
    ...(canonical ? { alternates: { canonical } } : {}),
  };
}

export default async function ScorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const score = scores.find((item) => item.slug === slug);
  if (!score) notFound();
  return <ScoreDetail score={score} />;
}
