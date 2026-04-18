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

export interface Urgency {
  key: string;
  label: string;
  emoji: string;
  color: string;
}

export const TASK_URGENCIES: Urgency[] = [
  { key: "NOW", label: "Akut", emoji: "🔴", color: "#EF4444" },
  { key: "TODAY", label: "Idag", emoji: "🟠", color: "#F59E0B" },
  { key: "THIS_WEEK", label: "Denna vecka", emoji: "🟡", color: "#3B82F6" },
  { key: "FLEXIBLE", label: "Flexibelt", emoji: "🟢", color: "#22C55E" },
];

export function getUrgencyLabel(key: string | undefined | null): string {
  return TASK_URGENCIES.find((u) => u.key === key)?.label ?? "Flexibelt";
}

export function getUrgencyColor(key: string | undefined | null): string {
  return TASK_URGENCIES.find((u) => u.key === key)?.color ?? "#22C55E";
}

