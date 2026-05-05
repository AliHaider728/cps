import GapReportView from "./GapReportView";

export default function RotaGapsPage() {
  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">Rota Gaps</h1>
        <p className="text-sm text-slate-500">Identify and fill upcoming gaps</p>
      </div>
      <GapReportView />
    </div>
  );
}
