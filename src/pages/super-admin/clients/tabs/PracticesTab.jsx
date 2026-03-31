/**
 * tabs/PracticesTab.jsx — Lists practices under a PCN (roll-up view)
 */
import { Stethoscope, MapPin, Hash, Briefcase } from "lucide-react";

const compKeys = ["ndaSigned","dsaSigned","mouReceived","welcomePackSent","templateInstalled","reportsImported"];

export function PracticesTab({ practices = [] }) {
  if (!practices.length) return (
    <div className="p-6 text-center py-14">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
        <Stethoscope size={22} className="text-slate-300" />
      </div>
      <p className="text-sm text-slate-500 font-medium">No practices linked</p>
      <p className="text-xs text-slate-400 mt-1">Practices linked to this PCN will appear here</p>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        Linked Practices ({practices.length})
      </p>
      {practices.map((pr, i) => {
        const done     = compKeys.filter(k => pr[k]).length;
        const pct      = Math.round((done / compKeys.length) * 100);
        const barColor = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
        const badgeColor = pct >= 80
          ? "bg-emerald-100 text-emerald-700"
          : pct >= 50
            ? "bg-amber-100 text-amber-700"
            : "bg-red-100 text-red-600";

        return (
          <div key={pr._id || i}
            className="p-4 bg-white border border-slate-200 rounded-xl
              hover:border-emerald-200 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <Stethoscope size={15} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                {/* Name + contract badge */}
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <p className="font-semibold text-slate-800 text-sm">{pr.name}</p>
                  <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                    {pr.contractType && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {pr.contractType}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {pr.odsCode && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Hash size={10} />{pr.odsCode}
                    </span>
                  )}
                  {pr.fte && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Briefcase size={10} />{pr.fte}
                    </span>
                  )}
                  {pr.address && (
                    <span className="flex items-center gap-1 text-xs text-slate-500 truncate max-w-[180px] sm:max-w-none">
                      <MapPin size={10} className="shrink-0" />{pr.address}
                    </span>
                  )}
                </div>

                {/* Onboarding progress bar */}
                <div className="mt-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-400 font-medium">Onboarding</span>
                    <span className="text-[10px] font-bold text-slate-500">{done}/{compKeys.length}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PracticesTab;