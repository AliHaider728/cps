import { isUuid } from "./validators";

export interface PracticeEntity {
  id?: string | number;
  _id?: string | number;
  odsCode?: string;
  ods_code?: string;
  name?: string;
  practiceName?: string;
  practice_name?: string;
  [key: string]: any;
}

export interface PracticesPayload {
  practices?: PracticeEntity[];
  data?: {
    practices?: PracticeEntity[];
  };
}

/** Build id → name map from practices API payload or list */
export function buildPracticeNameMap(practicesData: PracticesPayload | PracticeEntity[] | undefined | null): Map<string, string> {
  const map = new Map<string, string>();
  const list =
    (!Array.isArray(practicesData) ? (practicesData as PracticesPayload)?.practices : null) ??
    (!Array.isArray(practicesData) ? (practicesData as PracticesPayload)?.data?.practices : null) ??
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

export interface ShiftEntity {
  practice_name?: string;
  surgery_name?: string;
  practice?: { name?: string };
  client?: { name?: string };
  practice_id?: string | number;
  surgery_id?: string | number;
  status?: string;
  shift_type?: string;
  [key: string]: any;
}

/** Resolve display name for a shift/rota row — never show raw UUID when avoidable */
export function resolvePracticeName(shift: ShiftEntity | null | undefined, practiceMap: Map<string, string> | undefined | null): string {
  const candidates = [
    shift?.practice_name,
    shift?.surgery_name,
    shift?.practice?.name,
    shift?.client?.name,
  ].filter((v): v is string => Boolean(v) && !isUuid(v));

  if (candidates.length) return candidates[0];

  const id = shift?.practice_id || shift?.surgery_id;
  if (!id) return "—";
  const fromMap = practiceMap?.get?.(String(id));
  if (fromMap) return fromMap;
  if (isUuid(String(id))) return "Unknown practice";
  const s = String(id);
  return isUuid(s) ? "Unknown practice" : s;
}

/** Shifts that belong in working-timesheet / shift lists (not leave blocks) */
export const WORKING_SHIFT_STATUSES = new Set(["working", "cover"]);

export function isWorkingShift(shift: ShiftEntity | null | undefined): boolean {
  const st = String(shift?.status || shift?.shift_type || "").toLowerCase();
  return WORKING_SHIFT_STATUSES.has(st);
}
