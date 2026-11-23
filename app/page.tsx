import { CatalogHome } from "@/components/catalog-home";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return <CatalogHome key={q} initialQuery={q} />;
}
