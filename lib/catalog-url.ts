export type CatalogUrlPatch = {
  q?: string;
  category?: string;
  difficulty?: string;
  saved?: boolean;
};

export type CatalogUrlState = {
  q: string;
  category: string;
  difficulty: string;
  saved: boolean;
};

export function parseCatalogUrlSearch(search: string): CatalogUrlState {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  return {
    q: params.get("q") ?? "",
    category: params.get("category") ?? "",
    difficulty: params.get("difficulty") ?? "",
    saved: params.get("saved") === "1",
  };
}

export function updateCatalogUrl(
  pathname: string,
  search: string,
  hash: string,
  patch: CatalogUrlPatch,
): string {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const updates: [keyof CatalogUrlPatch, string | null][] = [
    ["q", patch.q?.trim() || null],
    ["category", patch.category && patch.category !== "همه" ? patch.category : null],
    ["difficulty", patch.difficulty && patch.difficulty !== "همهٔ سطح‌ها" ? patch.difficulty : null],
    ["saved", patch.saved ? "1" : null],
  ];
  for (const [key, value] of updates) {
    if (value === null) params.delete(key);
    else params.set(key, value);
  }
  const query = params.toString();
  return `${pathname}${query ? `?${query}` : ""}${hash}`;
}
