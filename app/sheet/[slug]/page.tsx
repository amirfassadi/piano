import { notFound } from "next/navigation";
import { ScoreDetail } from "@/components/score-detail";
import { scores } from "@/lib/catalog";

export function generateStaticParams() {
  return scores.map((score) => ({ slug: score.slug }));
}

export default async function ScorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const score = scores.find((item) => item.slug === slug);
  if (!score) notFound();
  return <ScoreDetail score={score} />;
}
