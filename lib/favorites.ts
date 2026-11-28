export const FAVORITES_STORAGE_KEY = "nuance-saved-scores";

export function parseSavedScores(raw: string | null, allowedSlugs: readonly string[]): string[] {
  if (raw === null) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    const allowed = new Set(allowedSlugs);
    return [...new Set(value.filter((item): item is string => typeof item === "string" && allowed.has(item)))];
  } catch {
    return [];
  }
}

export function serializeSavedScores(slugs: readonly string[], allowedSlugs: readonly string[]): string {
  const allowed = new Set(allowedSlugs);
  return JSON.stringify([...new Set(slugs.filter((slug) => allowed.has(slug)))]);
}
