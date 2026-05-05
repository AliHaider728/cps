import { useMemo, useState } from "react";
import MonthlyCalendarView from "./MonthlyCalendarView";
import WeeklyView from "./WeeklyView";
import GapReportView from "./GapReportView";
import RotaFilters from "./RotaFilters";
import SendRotaModal from "./SendRotaModal";
import { useGenerateRota } from "../../../hooks/useRota";

const TABS = [
  { key: "monthly", label: "Monthly View" },
  { key: "weekly", label: "Weekly View" },
  { key: "gaps", label: "Gap Report" },
];

export default function RotaPage() {
  const [activeTab, setActiveTab] = useState("monthly");
  const [sendOpen, setSendOpen] = useState(false);
  const now = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const generate = useGenerateRota();

  const onGenerate = async () => {
    await generate.mutateAsync({ month, year });
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Rota & Bookings</h1>
          <p className="text-sm text-slate-500">Monthly rota, weekly view and gap reporting</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setSendOpen(true)} className="px-4 py-2 rounded-md border border-slate-200 text-slate-700 text-sm font-medium">Send Rota</button>
          <button type="button" onClick={onGenerate} disabled={generate.isPending} className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium disabled:opacity-60">
            {generate.isPending ? "Generating..." : "Generate Rota"}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <RotaFilters month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />
      </div>

      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => setActiveTab(t.key)} className={activeTab === t.key ? "px-3 py-2 rounded-md bg-slate-900 text-white text-sm" : "px-3 py-2 rounded-md bg-slate-100 text-slate-700 text-sm"}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "monthly" && <MonthlyCalendarView month={month} year={year} />}
      {activeTab === "weekly" && <WeeklyView month={month} year={year} />}
      {activeTab === "gaps" && <GapReportView />}
      <SendRotaModal open={sendOpen} onClose={() => setSendOpen(false)} month={month} year={year} />
    </div>
  );
}
