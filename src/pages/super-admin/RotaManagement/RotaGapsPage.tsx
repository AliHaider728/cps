import React from "react";
import GapReportView from "./GapReportView";
import { AlertTriangle } from "lucide-react";

export default function RotaGapsPage() {
  return (
    <div>
      {/* Header — bleeds to page edges like RotaPage */}
      <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-md">
            <AlertTriangle size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Rota Gaps</h1>
            <p className="mt-0.5 text-sm text-slate-500">Identify and fill upcoming unfilled shifts</p>
          </div>
        </div>
      </div>

      <GapReportView />
    </div>
  );
}
