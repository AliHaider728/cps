import { isUuid } from "./validators";

/** Never show raw UUID/ObjectId strings in the UI */
export function resolveName(field: any): string {
  if (!field) return "—";
  if (typeof field === "object") {
    return (
      field.name ||
      field.fullName ||
      field.practice_name ||
      field.surgery_name ||
      "—"
    );
  }
  if (typeof field === "string" && isUuid(field)) return "—";
  return String(field);
}
