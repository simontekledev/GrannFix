export function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "Just nu";
  if (diffMin < 60) return `${diffMin} min sedan`;
  if (diffH < 24) return diffH === 1 ? "1 timme sedan" : `${diffH} timmar sedan`;
  if (diffD === 1) return "Igår";
  if (diffD < 7) return `${diffD} dagar sedan`;
  if (diffD < 14) return "1 vecka sedan";
  if (diffD < 30) return `${Math.floor(diffD / 7)} veckor sedan`;
  return date.toLocaleDateString("sv-SE");
}
