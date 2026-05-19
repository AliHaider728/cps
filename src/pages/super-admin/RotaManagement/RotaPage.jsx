import { useMemo, useState } from "react";
import MonthlyCalendarView from "./MonthlyCalendarView";
import WeeklyView          from "./WeeklyView";
import GapReportView       from "./GapReportView";
import ClinicianDiaryView  from "./ClinicianDiaryView";
import RotaFilters         from "./RotaFilters";
import SendRotaModal       from "./SendRotaModal";
import { useGenerateRota, useRotaGaps, useSendRotaToClients } from "../../../hooks/useRota";
import {
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  Mail,
  RefreshCw,
  Loader2,
} from "lucide-react";

const TABS = [
  { key: "monthly", label: "Monthly",         Icon: Calendar      },
  { key: "weekly",  label: "Weekly",          Icon: Clock         },
  { key: "gaps",    label: "Gaps",            Icon: AlertTriangle },
  { key: "diary",   label: "Clinician Diary", Icon: Users         },
];

export default function RotaPage() {
  const [activeTab, setActiveTab] = useState("monthly");
  const [sendOpen,  setSendOpen]  = useState(false);
  const now = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());
  const generate = useGenerateRota();
  const sendToClients = useSendRotaToClients();
  const { data: gapsData } = useRotaGaps();
  const gaps = gapsData?.gaps || [];
  const urgent = gaps.filter((gap) => gap.urgency === "urgent").length;
  const critical = gaps.filter((gap) => gap.urgency === "critical").length;

  return (
    <div>
      {/* ── Header block — bleeds to page edges ── */}
      <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8">
        {/* Title + actions */}
        <div className="px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Rota &amp; Bookings
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Manage monthly rota, weekly view and gap reporting
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => sendToClients.mutateAsync({ month, year })}
              disabled={sendToClients.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold
                text-slate-700 bg-white border border-slate-200 rounded-xl
                hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <Mail size={15} />
              <span className="hidden sm:inline">{sendToClients.isPending ? "Sending..." : "Send to Clients"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Generate rota for ${month}/${year}?`)) {
                  generate.mutateAsync({ month, year });
                }
              }}
              disabled={generate.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold
                text-white bg-blue-600 rounded-xl hover:bg-blue-700 hover:shadow-md
                transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generate.isPending
                ? <><Loader2 size={15} className="animate-spin" /><span className="hidden sm:inline">Generating…</span></>
                : <><RefreshCw size={15} /><span className="hidden sm:inline">Generate Rota</span></>
              }
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 sm:px-6 lg:px-8 py-3 bg-slate-50 border-t border-slate-100">
          <RotaFilters month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-6 lg:px-8 flex items-center gap-1">
          {TABS.map(({ key, label, Icon }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={[
                  "flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-t-xl",
                  "transition-all duration-200 focus:outline-none border-b-2",
                  active
                    ? "text-blue-600 bg-blue-50 border-blue-600"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-transparent",
                ].join(" ")}
              >
                <Icon size={15} className={active ? "text-blue-600" : "text-slate-400"} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content — no extra min-height ── */}
      <div className="pt-6">
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Gaps next 14 days</p>
            <p className="mt-1 text-3xl font-black text-slate-900">{gaps.length}</p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-red-600">Urgent within 48h</p>
            <p className="mt-1 text-3xl font-black text-red-700">{urgent}</p>
          </div>
          <div className="rounded-lg border border-red-300 bg-red-100 p-4 animate-pulse">
            <p className="text-xs font-bold uppercase tracking-wide text-red-700">Critical within 24h</p>
            <p className="mt-1 text-3xl font-black text-red-800">{critical}</p>
          </div>
        </div>
        {activeTab === "monthly" && <MonthlyCalendarView month={month} year={year} />}
        {activeTab === "weekly"  && <WeeklyView          month={month} year={year} />}
        {activeTab === "gaps"    && <GapReportView />}
        {activeTab === "diary"   && <ClinicianDiaryView />}
      </div>

      <SendRotaModal open={sendOpen} onClose={() => setSendOpen(false)} month={month} year={year} />
    </div>
  );
}
