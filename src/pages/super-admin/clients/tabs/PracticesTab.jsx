/**
 * tabs/PracticesTab.jsx — Lists practices under a PCN (roll-up view)
 */
import { Stethoscope, MapPin, Hash, Briefcase, CheckCircle2, XCircle } from "lucide-react";

export function PracticesTab({ practices = [] }) {
  if (!practices.length) return (
    <div className="p-6 text-center py-14">
      <Stethoscope size={28} className="text-slate-200 mx-auto mb-2" />
      <p className="text-sm text-slate-400">No practices linked</p>
    </div>
  );

  // Compliance keys for roll-up
  const compKeys = ["ndaSigned","dsaSigned","mouReceived","welcomePackSent","templateInstalled","reportsImported"];

  return (
    <div className="p-6 space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
        Linked Practices ({practices.length})
      </p>
      {practices.map((pr, i) => {
        const done = compKeys.filter(k => pr[k]).length;
        const pct  = Math.round((done / compKeys.length) * 100);
        const barColor = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
        return (
          <div key={pr._id || i}
            className="p-4 bg-slate-50 border border-slate-200 rounded-xl
              hover:border-emerald-200 hover:bg-emerald-50/20 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <Stethoscope size={14} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{pr.name}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
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
                        <span className="flex items-center gap-1 text-xs text-slate-500 truncate max-w-[200px]">
                          <MapPin size={10} />{pr.address}
                        </span>
                      )}
                    </div>
                  </div>
                  {pr.contractType && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full
                      bg-blue-100 text-blue-700 shrink-0">
                      {pr.contractType}
                    </span>
                  )}
                </div>
                {/* Compliance bar */}
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-400">Onboarding</span>
                    <span className="text-[10px] font-bold text-slate-600">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
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