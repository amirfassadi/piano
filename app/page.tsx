import { CatalogHome } from "@/components/catalog-home";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; difficulty?: string }> }) {
  const { q = "", category = "", difficulty = "" } = await searchParams;
  return <CatalogHome key={`${q}|${category}|${difficulty}`} initialQuery={q} initialCategory={category} initialDifficulty={difficulty} />;
}
