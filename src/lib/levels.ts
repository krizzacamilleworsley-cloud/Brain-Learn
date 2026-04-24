export type Level = "easy" | "medium" | "hard";

export const LEVEL_META: Record<
  Level,
  { label: string; xpPerCorrect: number; questions: number; color: string; next: Level | null; emoji: string; tagline: string; secondsPerQuestion: number }
> = {
  easy:   { label: "Easy",   xpPerCorrect: 10, questions: 10, color: "secondary", next: "medium", emoji: "🌱", tagline: "Warm-up zone", secondsPerQuestion: 20 },
  medium: { label: "Medium", xpPerCorrect: 20, questions: 10, color: "primary",   next: "hard",   emoji: "⚡", tagline: "Heat rising",  secondsPerQuestion: 15 },
  hard:   { label: "Hard",   xpPerCorrect: 35, questions: 10, color: "accent",    next: null,     emoji: "🔥", tagline: "Boss fight",   secondsPerQuestion: 12 },
};

export const ALL_LEVELS: Level[] = ["easy", "medium", "hard"];

export function nextLevel(current: Level): Level | null {
  return LEVEL_META[current].next;
}
