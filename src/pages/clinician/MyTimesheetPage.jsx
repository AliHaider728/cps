import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { useMyTimesheet, useSubmitTimesheet, useUpdateTimesheetEntry } from "../../hooks/useRota";

const statusColor = { draft: "default", submitted: "warning", approved: "success", rejected: "danger" };

function hours(start, end) {
  if (!start || !end) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = eh * 60 + em - (sh * 60 + sm);
  return diff > 0 ? Math.round((diff / 60) * 100) / 100 : null;
}

function diffMeta(expected, actual) {
  const diff = Math.round((Number(actual || 0) - Number(expected || 0)) * 100) / 100;
  const color = Math.abs(diff) === 0 ? "success" : Math.abs(diff) < 1 ? "warning" : "danger";
  return { diff, color };
}

export default function MyTimesheetPage() {
  const today = new Date();
  const [cursor, setCursor] = useState({ month: today.getMonth() + 1, year: today.getFullYear() });
  const [drafts, setDrafts] = useState({});
  const [confirming, setConfirming] = useState(false);
  const { data, isLoading, error } = useMyTimesheet(cursor.month, cursor.year);
  const updateEntry = useUpdateTimesheetEntry();
  const submit = useSubmitTimesheet();

  const timesheet = data?.timesheet;
  const entries = data?.entries || [];
  const rows = useMemo(() => entries.map((entry) => ({ ...entry, ...(drafts[entry.id] || {}) })), [entries, drafts]);
  const isDraft = timesheet?.status === "draft" || timesheet?.status === "rejected";
  const title = new Date(cursor.year, cursor.month - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const moveMonth = (delta) => {
    const next = new Date(cursor.year, cursor.month - 1 + delta, 1);
    setCursor({ month: next.getMonth() + 1, year: next.getFullYear() });
    setDrafts({});
  };

  const setRow = (id, key, value) => setDrafts((current) => ({ ...current, [id]: { ...(current[id] || {}), [key]: value } }));
  const saveRow = (entry) => updateEntry.mutate({ entryId: entry.id, data: { start_time: entry.start_time, end_time: entry.end_time, notes: entry.notes || "" } });
  const missingRows = rows.filter((entry) => !entry.start_time || !entry.end_time);

  const handleSubmit = () => {
    submit.mutate(timesheet.id, {
      onSuccess: () => setConfirming(false),
    });
  };

  return (
    <div className="space-y-5 pb-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Timesheet - {title}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge color={statusColor[timesheet?.status] || "default"}>{timesheet?.status || "Draft"}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => moveMonth(-1)} title="Previous month">
            <ChevronLeft size={18} />
          </Button>
          <Button variant="outline" size="icon" onClick={() => moveMonth(1)} title="Next month">
            <ChevronRight size={18} />
          </Button>
          <Button disabled={!isDraft || missingRows.length > 0} isLoading={submit.isLoading} onClick={() => setConfirming(true)}>
            <Send size={16} /> Submit
          </Button>
        </div>
      </div>

      {timesheet?.status === "rejected" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {timesheet.rejection_reason || "This timesheet was rejected. Please update and resubmit."}
        </div>
      )}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}</div>}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[1040px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Surgery Name</th>
              <th className="px-4 py-3">Expected Hours</th>
              <th className="px-4 py-3">Start Time</th>
              <th className="px-4 py-3">End Time</th>
              <th className="px-4 py-3">Actual Hours</th>
              <th className="px-4 py-3">Difference</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-4 py-3">Cover?</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                  Loading timesheet...
                </td>
              </tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                  No rota shifts found for this month.
                </td>
              </tr>
            )}
            {rows.map((entry) => {
              const actual = hours(entry.start_time, entry.end_time) ?? entry.actual_hours;
              const meta = diffMeta(entry.expected_hours, actual);
              const date = new Date(`${entry.shift_date}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
              return (
                <tr key={entry.id} className={entry.is_cover ? "bg-amber-50" : "bg-white"}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{date}</td>
                  <td className="px-4 py-3">{entry.surgery_name}</td>
                  <td className="px-4 py-3">{Number(entry.expected_hours || 0).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <input
                      disabled={!isDraft}
                      type="time"
                      value={entry.start_time || ""}
                      onChange={(e) => setRow(entry.id, "start_time", e.target.value)}
                      onBlur={() => saveRow(entry)}
                      className="rounded-md border border-slate-200 px-2 py-1 disabled:bg-slate-50"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      disabled={!isDraft}
                      type="time"
                      value={entry.end_time || ""}
                      onChange={(e) => setRow(entry.id, "end_time", e.target.value)}
                      onBlur={() => saveRow(entry)}
                      className="rounded-md border border-slate-200 px-2 py-1 disabled:bg-slate-50"
                    />
                  </td>
                  <td className="px-4 py-3">{actual == null ? "-" : Number(actual).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Badge color={meta.color}>{meta.diff.toFixed(2)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      disabled={!isDraft}
                      value={entry.notes || ""}
                      onChange={(e) => setRow(entry.id, "notes", e.target.value)}
                      onBlur={() => saveRow(entry)}
                      className="w-full rounded-md border border-slate-200 px-2 py-1 disabled:bg-slate-50"
                    />
                  </td>
                  <td className="px-4 py-3">{entry.is_cover && <Badge color="warning">Cover</Badge>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900">Submit timesheet?</h2>
            <p className="mt-2 text-sm text-slate-600">Once submitted, your timesheet will go to the approvals queue.</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} isLoading={submit.isLoading}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}       