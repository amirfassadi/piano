import { notFound } from "next/navigation";
import { CollectionPage } from "@/components/collection-page";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ section: "payments", subpage: "my-scores" }];
}

export default async function NestedSectionRoute({ params }: { params: Promise<{ section: string; subpage: string }> }) {
  const { section, subpage } = await params;
  if (section !== "payments" || subpage !== "my-scores") notFound();
  return <CollectionPage section="payments" />;
}
