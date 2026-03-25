import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const ROLE_HOME = {
  super_admin: "/dashboard/super-admin",
  director:    "/dashboard/director",
  ops_manager: "/dashboard/ops-manager",
  finance:     "/dashboard/finance",
  training:    "/dashboard/training",
  workforce:   "/dashboard/workforce",
  clinician:   "/portal/clinician",
};

export default function Unauthorized() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const home      = user ? ROLE_HOME[user.role] : "/login";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M12 15v.01M12 9v4m0 0a9 9 0 110 0M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        <p className="text-5xl font-black text-slate-200 mb-2">403</p>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          You don't have permission to view this page.
          If you believe this is a mistake, contact your system administrator.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            ← Go Back
          </button>
          <Link
            to={home}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-px"
            style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}
          >
            Go to My Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}   