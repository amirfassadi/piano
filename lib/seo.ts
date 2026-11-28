export function canonicalUrl(path: string): string | undefined {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configured) return undefined;
  try {
    const base = new URL(configured);
    if (base.protocol !== "https:" && base.protocol !== "http:") return undefined;
    return new URL(path.startsWith("/") ? path : `/${path}`, base.origin).toString();
  } catch {
    return undefined;
  }
}
