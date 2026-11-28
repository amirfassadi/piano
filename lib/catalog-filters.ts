export const DIFFICULTY_LEVELS = ["آسان", "متوسط", "سخت"] as const;
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];
export const ALL_DIFFICULTIES = "همهٔ سطح‌ها";
export const ARRANGEMENT_UNSPECIFIED = "انتخاب تنظیم";

/** Return only levels explicitly named or spanned by a catalog label. */
export function difficultyLevels(label: string): DifficultyLevel[] {
  const normalized = label.trim().replace(/\s+/g, " ");
  if (!normalized || normalized === ARRANGEMENT_UNSPECIFIED) return [];

  const range = normalized.split(" تا ");
  if (range.length === 2) {
    const start = DIFFICULTY_LEVELS.indexOf(range[0] as DifficultyLevel);
    const end = DIFFICULTY_LEVELS.indexOf(range[1] as DifficultyLevel);
    if (start >= 0 && end >= start) return DIFFICULTY_LEVELS.slice(start, end + 1);
    return [];
  }

  return DIFFICULTY_LEVELS.includes(normalized as DifficultyLevel)
    ? [normalized as DifficultyLevel]
    : [];
}

export function matchesDifficulty(label: string, selected: string): boolean {
  if (selected === ALL_DIFFICULTIES) return true;
  if (!DIFFICULTY_LEVELS.includes(selected as DifficultyLevel)) return false;
  return difficultyLevels(label).includes(selected as DifficultyLevel);
}
