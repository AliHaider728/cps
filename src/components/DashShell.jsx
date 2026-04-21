import { ShieldCheck, Calendar, User, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const DashShell = ({ role, colorClass, gradientClass, stats }) => {
  const { user } = useAuth();

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-8xl mx-auto space-y-6">

      {/* ── Header Banner ── */}
      <div
        className={`relative overflow-hidden rounded-2xl p-7 text-white shadow-lg ${gradientClass ?? colorClass}`}
        style={{ background: gradientClass ? undefined : undefined }}
      >
        {/* Decorative rings */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 rounded-full bg-white/10" />

        <div className="relative flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm mb-3">
              <ShieldCheck size={11} />
              {role} Dashboard
            </span>

            <h1 className="text-2xl font-extrabold tracking-tight leading-tight">
              Welcome back,{" "}
              <span className="opacity-90">{user?.name?.split(" ")[0]}</span>
            </h1>

            <p className="mt-1.5 flex items-center gap-1.5 text-sm opacity-70">
              <Calendar size={13} />
              {today}
            </p>
          </div>

          {/* Avatar bubble */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-2 ring-white/30">
            <User size={20} className="text-white" />
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className="
              group relative overflow-hidden rounded-2xl border border-slate-200
              bg-white p-5 shadow-sm
              transition-all duration-200
              hover:-translate-y-1 hover:shadow-lg hover:border-slate-300
              cursor-default
            "
          >
            {/* Subtle hover glow strip */}
            <div
              className={`
                absolute inset-x-0 top-0 h-0.5 rounded-full
                opacity-0 group-hover:opacity-100 transition-opacity duration-200
                ${colorClass}
              `}
            />

            {/* Icon */}
            <div
              className={`
                mb-4 flex h-9 w-9 items-center justify-center rounded-xl
                ${colorClass} bg-opacity-10
                group-hover:scale-110 transition-transform duration-200
              `}
            >
              <s.icon
                size={17}
                className={`${colorClass.replace("bg-", "text-")} opacity-80`}
              />
            </div>

            {/* Value */}
            <p className="text-2xl font-extrabold tracking-tight text-slate-800">
              {s.value}
            </p>

            {/* Label */}
            <p className="mt-0.5 text-sm font-semibold text-slate-600">
              {s.label}
            </p>

            {/* Sub-text */}
            {s.sub && (
              <p className="mt-1 text-xs text-slate-400 leading-snug">
                {s.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ── Ready Banner ── */}
      <div
        className="
          group flex flex-col items-center justify-center gap-3
          rounded-2xl border border-slate-200 bg-white
          p-10 text-center shadow-sm
          transition-all duration-200 hover:shadow-md hover:border-slate-300
        "
      >
        <div
          className={`
            flex h-13 w-13 items-center justify-center rounded-2xl
            ${colorClass} shadow-md
            group-hover:scale-105 transition-transform duration-200
          `}
        >
          <Sparkles size={22} className="text-white" />
        </div>

        <div>
          <h3 className="text-lg font-extrabold text-slate-800">
            {role} — All Systems Ready
          </h3>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">
            Use the sidebar to navigate your modules. Every section is
            role-restricted to your access level.
          </p>
        </div>

        <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <ShieldCheck size={12} className="text-green-500" />
          Role-based access active
        </div>
      </div>
    </div>
  );
};

export default DashShell;