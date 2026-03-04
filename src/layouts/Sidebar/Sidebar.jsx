import { NavLink, useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { sidebarConfig } from "../../data/sidebarConfig.js";

const ROLE_LABELS = {
  super_admin: "Super Admin", director: "Director", ops_manager: "Ops Manager",
  finance: "Finance", training: "Training & Dev", workforce: "Workforce / VA", clinician: "Clinician",
};
const ROLE_COLORS = {
  super_admin: "bg-red-100 text-red-700", director: "bg-purple-100 text-purple-700",
  ops_manager: "bg-orange-100 text-orange-700", finance: "bg-yellow-100 text-yellow-700",
  training: "bg-green-100 text-green-700", workforce: "bg-cyan-100 text-cyan-700",
  clinician: "bg-slate-100 text-slate-700",
};

const DynIcon = ({ name, size = 16 }) => {
  const Icon = Icons[name] || Icons.Circle;
  return <Icon size={size} />;
};

const Sidebar = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sections = sidebarConfig[user?.role] || [];

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setIsOpen(false)} />
      )}
      <aside className={`fixed top-0 left-0 h-full z-40 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 shadow-sm ${isCollapsed ? "w-16" : "w-64"} ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-slate-100 min-h-[64px]">
          {!isCollapsed && (
            <img src="https://coreprescribingsolutions.co.uk/wp-content/themes/core-prescribing/images/core-prescribing-logo.png" alt="CPS" className="h-9 w-auto object-contain" />
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <DynIcon name={isCollapsed ? "PanelLeftOpen" : "PanelLeftClose"} size={18} />
          </button>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <DynIcon name="X" size={18} />
          </button>
        </div>

        {/* User badge */}
        {!isCollapsed && user && (
          <div className="px-3 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${ROLE_COLORS[user.role]}`}>
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 sidebar-scroll">
          {sections.map((sec, si) => (
            <div key={si}>
              {!isCollapsed && (
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase px-2 mb-1">{sec.section}</p>
              )}
              <ul className="space-y-0.5">
                {sec.items.map((item, ii) => (
                  <li key={ii}>
                    <NavLink to={item.path} onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${isActive ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"} ${isCollapsed ? "justify-center" : ""}`
                      }
                      title={isCollapsed ? item.label : undefined}>
                      <span className="shrink-0"><DynIcon name={item.icon} size={16} /></span>
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-2 py-3 border-t border-slate-100">
          <button onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? "Logout" : undefined}>
            <Icons.LogOut size={16} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
