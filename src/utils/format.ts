export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function formatRemainingTime(current: number, total: number): string {
  if (isNaN(total) || total <= 0) return "-0:00";
  const remaining = Math.max(0, total - current);
  return `-${formatTime(remaining)}`;
}
