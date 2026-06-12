import { isUuid } from "./validators";

/** Build id → name map from practices API payload or list */
export function buildPracticeNameMap(practicesData) {
  const map = new Map();
  const list =
    practicesData?.practices ??
    practicesData?.data?.practices ??
    (Array.isArray(practicesData) ? practicesData : []);

  if (!Array.isArray(list)) return map;

  list.forEach((p) => {
    const name = p?.name || p?.practiceName || p?.practice_name || "";
    if (!name) return;
    for (const key of [p.id, p._id, p.odsCode, p.ods_code]) {
      if (key) map.set(String(key), name);
    }
  });
  return map;
}

/** Resolve display name for a shift/rota row — never show raw UUID when avoidable */
export function resolvePracticeName(shift, practiceMap) {
  const candidates = [
    shift?.practice_name,
    shift?.surgery_name,
    shift?.practice?.name,
    shift?.client?.name,
  ].filter((v) => v && !isUuid(v));

  if (candidates.length) return candidates[0];

  const id = shift?.practice_id || shift?.surgery_id;
  if (!id) return "—";
  const fromMap = practiceMap?.get?.(String(id));
  if (fromMap) return fromMap;
  if (isUuid(id)) return "Unknown practice";
  const s = String(id);
  return isUuid(s) ? "Unknown practice" : s;
}

/** Shifts that belong in working-timesheet / shift lists (not leave blocks) */
export const WORKING_SHIFT_STATUSES = new Set(["working", "cover"]);

export function isWorkingShift(shift) {
  const st = String(shift?.status || shift?.shift_type || "").toLowerCase();
  return WORKING_SHIFT_STATUSES.has(st);
}
