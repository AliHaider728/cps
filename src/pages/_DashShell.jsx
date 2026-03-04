import { ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const DashShell = ({ role, colorClass, stats }) => {
  const { user } = useAuth();
  return (
    <div className="max-w-6xl mx-auto">
      <div className={`${colorClass} rounded-2xl p-6 mb-6 text-white`}>
        <p className="text-sm font-semibold opacity-80 mb-1">{role} Dashboard</p>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="text-sm opacity-70 mt-1">{new Date().toLocaleDateString("en-GB", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-2 bg-slate-100 rounded-xl w-fit mb-3"><s.icon size={16} className="text-slate-600" /></div>
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-sm font-semibold text-slate-600">{s.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <div className={`w-12 h-12 ${colorClass} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
          <ShieldCheck size={22} className="text-white" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">{role} — Ready</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">Use the sidebar to navigate. All sections are role-restricted based on your access level.</p>
      </div>
    </div>
  );
};

export default DashShell;
