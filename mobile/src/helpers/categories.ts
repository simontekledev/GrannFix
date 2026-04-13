export interface Category {
  key: string;
  label: string;
  emoji: string;
}

export const TASK_CATEGORIES: Category[] = [
  { key: "CARRYING", label: "Bärhjälp", emoji: "📦" },
  { key: "MOVING", label: "Flytthjälp", emoji: "🚚" },
  { key: "MOUNTING", label: "Montering", emoji: "🔧" },
  { key: "CLEANING", label: "Städning", emoji: "🧹" },
  { key: "GARDENING", label: "Trädgård", emoji: "🌿" },
  { key: "REPAIRS", label: "Reparation", emoji: "🔨" },
  { key: "DELIVERY", label: "Leverans", emoji: "📬" },
  { key: "OTHER", label: "Övrigt", emoji: "✨" },
];

export function getCategoryLabel(key: string | undefined | null): string {
  return TASK_CATEGORIES.find((c) => c.key === key)?.label ?? "Övrigt";
}

export function getCategoryEmoji(key: string | undefined | null): string {
  return TASK_CATEGORIES.find((c) => c.key === key)?.emoji ?? "✨";
}
