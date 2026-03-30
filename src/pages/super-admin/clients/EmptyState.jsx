/**
 * EmptyState.jsx — shown when nothing is selected in the tree
 */
import { Building2, ArrowLeft, Network, Stethoscope } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm
      flex flex-col items-center justify-center h-full min-h-[400px] text-center p-10">

      {/* Nested rings */}
      <div className="relative mb-7">
        <div className="w-28 h-28 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-blue-200 border-2 border-blue-300 flex items-center justify-center">
              <Building2 size={20} className="text-blue-600" />
            </div>
          </div>
        </div>
        {/* Floating icons */}
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-purple-100 border-2 border-white
          flex items-center justify-center shadow-sm">
          <Network size={12} className="text-purple-600" />
        </div>
        <div className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full bg-emerald-100 border-2 border-white
          flex items-center justify-center shadow-sm">
          <Stethoscope size={12} className="text-emerald-600" />
        </div>
      </div>

      <h3 className="text-[15px] font-bold text-slate-700 mb-2">
        Select a client to view details
      </h3>
      <p className="text-sm text-slate-400 max-w-[220px] leading-relaxed">
        Click any PCN or Practice in the hierarchy tree to see its full record.
      </p>
      <div className="flex items-center gap-1.5 mt-5 text-xs text-slate-400 font-medium">
        <ArrowLeft size={12} />
        Choose from the hierarchy on the left
      </div>
    </div>
  );
}   