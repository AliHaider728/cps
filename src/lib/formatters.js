/**
 * Date and value formatting utilities
 * Consolidated formatters used across the application
 */

export const fmtDate = (d) => {
  if (!d) return "—";
  try {
    const raw = String(d);
    const dateOnly = raw.includes("T") ? raw.split("T")[0] : raw.slice(0, 10);
    const dt = new Date(dateOnly);
    if (Number.isNaN(dt.getTime())) return dateOnly;
    return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return String(d);
  }
};

export const fmtDateInput = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toISOString().split("T")[0];
  } catch {
    return "";
  }
};
