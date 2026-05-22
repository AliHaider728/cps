const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value) {
  return UUID_RE.test(String(value || "").trim());
}

/** Never show raw UUID/ObjectId strings in the UI */
export function resolveName(field) {
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
