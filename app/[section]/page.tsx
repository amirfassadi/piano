import { notFound } from "next/navigation";
import { CollectionPage } from "@/components/collection-page";

export const dynamicParams = false;

const sections = ["scores", "artists", "song-requests", "subscription", "support", "feedback", "start-piano", "iranian-piano-sheets", "classical-piano-sheets", "easy-piano-sheets", "free-piano-sheets", "film-piano-sheets", "instrumental-piano-sheets", "account", "settings", "payments"];

export function generateStaticParams() {
  return sections.map((section) => ({ section }));
}

export default async function SectionRoute({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  return <CollectionPage section={section} />;
}
