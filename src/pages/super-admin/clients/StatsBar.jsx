/**
 * StatsBar.jsx — animated stats row
 */
import { Building2, Layers, Network, Stethoscope } from "lucide-react";

const STATS = [
  { key: "icbs",        label: "ICBs",        icon: Building2,   bg: "bg-blue-50",    text: "text-blue-600",   border: "border-blue-100"   },
  { key: "federations", label: "Federations", icon: Layers,      bg: "bg-indigo-50",  text: "text-indigo-600", border: "border-indigo-100" },
  { key: "pcns",        label: "PCNs",        icon: Network,     bg: "bg-purple-50",  text: "text-purple-600", border: "border-purple-100" },
  { key: "practices",   label: "Practices",   icon: Stethoscope, bg: "bg-emerald-50", text: "text-emerald-600",border: "border-emerald-100"},
];

export default function StatsBar({ counts = {}, loading }) {
  return (
    <div className="flex items-center gap-3 px-6 pb-4 flex-wrap">
      {STATS.map(({ key, label, icon: Icon, bg, text, border }) => (
        <div key={key}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${border} ${bg}
            shadow-sm min-w-[120px] flex-1 sm:flex-none`}>
          <div className={`w-7 h-7 rounded-lg ${bg} ${text} flex items-center justify-center`}>
            <Icon size={14} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-0.5">
              {label}
            </p>
            <p className={`text-xl font-black ${text} leading-none`}>
              {loading
                ? <span className="inline-block w-8 h-5 bg-slate-200 rounded animate-pulse" />
                : (counts[key] ?? 0)
              }
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}