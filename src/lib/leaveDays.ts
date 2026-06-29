/** Working-day count between two ISO dates (inclusive). */
export function dayCount(startDate: string | Date, endDate?: string | Date | null): number {
  const start = new Date(`${String(startDate).slice(0, 10)}T00:00:00`);
  const end = new Date(`${String(endDate || startDate).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  let days = 0;
  const d = new Date(start);
  while (d <= end) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) days += 1;
    d.setDate(d.getDate() + 1);
  }
  return Math.max(days, 1);
}
