import { NavLink, useNavigate, useLocation } from "react-router-dom";
import * as Icons from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { sidebarConfig } from "../../data/sidebarConfig.js";

/*  Role metadata  */
const ROLE_META = {
  super_admin: { label: "Super Admin",    color: "#ef4444" },
  director:    { label: "Director",       color: "#8b5cf6" },
  ops_manager: { label: "Ops Manager",    color: "#f97316" },
  finance:     { label: "Finance",        color: "#eab308" },
  training:    { label: "Training & Dev", color: "#22c55e" },
  workforce:   { label: "Workforce / VA", color: "#06b6d4" },
  clinician:   { label: "Clinician",      color: "#64748b" },
};

/*  Dynamic icon  */
const DynIcon = ({ name, size = 16 }) => {
  const Icon = Icons[name] || Icons.Circle;
  return <Icon size={size} />;
};

/*  Tooltip for collapsed mode  */
const Tooltip = ({ label, children }) => (
  <div className="relative group/tip">
    {children}
    <div className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2
      translate-x-2 opacity-0
      group-hover/tip:translate-x-0 group-hover/tip:opacity-100
      transition-all duration-200 z-[9999] whitespace-nowrap
      bg-slate-900 text-white text-xs font-semibold
      px-2.5 py-1.5 rounded-lg shadow-xl">
      {label}
      <span className="absolute right-full top-1/2 -translate-y-1/2
        border-[5px] border-transparent border-r-slate-900" />
    </div>
  </div>
);

/*  Nav item with optional dropdown  */
const NavItem = ({ item, isCollapsed, closeDrawer, depth = 0 }) => {
  const location = useLocation();
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;

  const isParentActive = hasChildren && item.children.some(
    c => location.pathname === c.path || location.pathname.startsWith(c.path + "/")
  );

  const [open, setOpen] = useState(isParentActive);
  useEffect(() => { if (isParentActive) setOpen(true); }, [isParentActive]);

  const handleClick = (e) => {
    if (hasChildren) { e.preventDefault(); setOpen(o => !o); }
    else closeDrawer();
  };

  const Inner = ({ isActive }) => {
    const active = isActive || isParentActive;
    return (
      <>
        {/* Left accent bar */}
        <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full
          bg-blue-600 transition-all duration-300
          ${active ? "h-[55%] opacity-100" : "h-0 opacity-0"}`}
        />

        {/* Icon */}
        <span className={`flex items-center justify-center rounded-lg shrink-0
          transition-all duration-200
          ${depth > 0 ? "w-5 h-5" : "w-8 h-8"}
          ${active
            ? "bg-blue-50 text-blue-600"
            : "text-slate-400 group-hover/item:bg-slate-100 group-hover/item:text-slate-600"
          }`}>
          <DynIcon name={item.icon} size={depth > 0 ? 13 : 15} />
        </span>

        {/* Label */}
        {!isCollapsed && (
          <span className={`flex-1 text-[13px] truncate transition-colors duration-200
            ${active
              ? "text-blue-700 font-semibold"
              : "text-slate-600 font-medium group-hover/item:text-slate-900"
            }`}>
            {item.label}
          </span>
        )}

        {/* Chevron for parent */}
        {!isCollapsed && hasChildren && (
          <Icons.ChevronRight size={13}
            className={`shrink-0 text-slate-400 transition-transform duration-200
              ${open ? "rotate-90" : "rotate-0"}`}
          />
        )}

        {/* Hover pip */}
        {!isCollapsed && !hasChildren && (
          <span className={`w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0
            transition-all duration-150
            ${active
              ? "opacity-0 scale-0"
              : "opacity-0 scale-0 group-hover/item:opacity-100 group-hover/item:scale-100"
            }`}
          />
        )}
      </>
    );
  };

  const baseClass = `group/item relative flex items-center gap-2.5 w-full rounded-xl
    transition-all duration-200 cursor-pointer select-none
    border border-transparent
    hover:bg-slate-50 hover:border-slate-200/70
    ${depth > 0 ? "py-2 pl-3 pr-2 my-px" : "py-[9px] px-2 my-px"}
    ${isCollapsed ? "justify-center !p-2.5" : ""}`;

  const activeClass = "bg-blue-50/80 border-blue-200/60 hover:bg-blue-50";

  const node = hasChildren ? (
    <div
      className={`${baseClass} ${(open || isParentActive) ? activeClass : ""}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && handleClick(e)}
    >
      <Inner isActive={false} />
    </div>
  ) : (
    <NavLink
      to={item.path}
      onClick={handleClick}
      className={({ isActive }) => `${baseClass} ${isActive ? activeClass : ""}`}
    >
      {({ isActive }) => <Inner isActive={isActive} />}
    </NavLink>
  );

  return (
    <li className="list-none">
      {isCollapsed ? <Tooltip label={item.label}>{node}</Tooltip> : node}

      {/* Smooth dropdown */}
      {hasChildren && !isCollapsed && (
        <div
          className="overflow-hidden transition-all duration-300 ease-out"
          style={{
            maxHeight: open ? `${item.children.length * 46}px` : "0px",
            opacity: open ? 1 : 0,
          }}
        >
          <div className="relative pl-4 mt-0.5 pb-0.5">
            <div className="absolute left-[19px] top-0 bottom-2 w-px bg-slate-200 rounded-full" />
            <ul className="space-y-0 pr-1">
              {item.children.map((child, i) => (
                <NavItem key={i} item={child} isCollapsed={false} closeDrawer={closeDrawer} depth={1} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
};

/* 
   Main Sidebar
  */
const Sidebar = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sections = sidebarConfig[user?.role] || [];
  const role = ROLE_META[user?.role] || ROLE_META.clinician;

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Shell */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 flex flex-col
          bg-white border-r border-slate-200
          transition-[width,transform] duration-[280ms] ease-[cubic-bezier(.4,0,.2,1)]
          shadow-[6px_0_40px_rgba(15,23,42,0.07)]
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{ width: isCollapsed ? 68 : 256 }}
      >

        {/*  Logo + Name  */}
        <div className="flex items-center justify-between px-3 min-h-[64px] shrink-0
          border-b border-slate-100">

          {/* Expanded: logo + name */}
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-2">
              <img
                src="https://coreprescribingsolutions.co.uk/wp-content/themes/core-prescribing/images/core-prescribing-logo.png"
                alt="CPS"
                className="h-10 w-10 object-contain rounded-lg shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[14.5px] font-bold text-slate-800 leading-tight truncate">
                  Core Prescribing
                </p>
                <p className="text-[12px] font-medium text-slate-400 leading-tight truncate">
                  Solutions
                </p>
              </div>
            </div>
          )}

          {/* Collapsed: logo only */}  
          {isCollapsed && (
            <div className="w-full flex justify-center">
              <img
                src="https://coreprescribingsolutions.co.uk/wp-content/themes/core-prescribing/images/core-prescribing-logo.png"
                alt="CPS"
                className="h-8 w-8 object-contain rounded-lg"
              />
            </div>
          )}

          {/* Collapse toggle */}
          <button
            onClick={() => setIsCollapsed(c => !c)}
            title={isCollapsed ? "Expand" : "Collapse"}
            className="hidden md:flex w-7 h-7 rounded-lg items-center justify-center shrink-0
              border border-slate-200 text-slate-400
              hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300
              transition-all duration-200"
          >
            <DynIcon name={isCollapsed ? "PanelLeftOpen" : "PanelLeftClose"} size={14} />
          </button>

          {/* Mobile close */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden w-7 h-7 rounded-lg flex items-center justify-center shrink-0
              border border-slate-200 text-slate-400
              hover:bg-slate-100 hover:text-slate-700
              transition-all duration-200"
          >
            <Icons.X size={14} />
          </button>
        </div>

        {/*  User card  */}
        {user && (
          <div className="px-3 py-3 shrink-0 border-b border-slate-100">
            {isCollapsed ? (
              <Tooltip label={`${user.name} · ${role.label}`}>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto
                    text-sm font-bold text-white cursor-default
                    hover:scale-105 transition-transform duration-200"
                  style={{
                    background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                    boxShadow: "0 3px 12px rgba(99,102,241,.3)",
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </Tooltip>
            ) : (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50
                hover:bg-slate-100/80 transition-all duration-200 cursor-default">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                    text-[15px] font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                    boxShadow: "0 3px 12px rgba(99,102,241,.28)",
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-slate-800 truncate leading-tight">
                    {user.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: role.color }} />
                    <span className="text-[10.5px] font-semibold truncate"
                      style={{ color: role.color }}>
                      {role.label}
                    </span>
                  </div>
                </div>

                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}
                />
              </div>
            )}
          </div>
        )}

        {/*  Nav  */}
        <nav className="flex-1 overflow-y-auto py-2 px-2
          [scrollbar-width:thin] [scrollbar-color:#e2e8f0_transparent]
          [&::-webkit-scrollbar]:w-[3px]
          [&::-webkit-scrollbar-thumb]:bg-slate-200
          [&::-webkit-scrollbar-thumb]:rounded-full">
          {sections.map((sec, si) => (
            <div key={si} className="mb-1">
              {!isCollapsed ? (
                <p className="text-[9px] font-bold uppercase tracking-[.12em]
                  text-slate-400 px-3 pt-3 pb-1.5">
                  {sec.section}
                </p>
              ) : si > 0 ? (
                <div className="h-px bg-slate-100 mx-2 my-2" />
              ) : null}

              <ul className="space-y-0">
                {sec.items.map((item, ii) => (
                  <NavItem
                    key={ii}
                    item={item}
                    isCollapsed={isCollapsed}
                    closeDrawer={() => setIsOpen(false)}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/*  Footer  */}
        <div className="shrink-0 px-2 pb-3 pt-2 border-t border-slate-100">
          {isCollapsed ? (
            <Tooltip label="Logout">
              <button
                onClick={handleLogout}
                className="w-full flex justify-center items-center py-2.5 rounded-xl
                  text-red-400 hover:bg-red-50 hover:text-red-500
                  transition-all duration-200"
              >
                <Icons.LogOut size={16} />
              </button>
            </Tooltip>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl
                text-[13px] font-semibold text-red-500
                hover:bg-red-50 hover:text-red-600
                transition-all duration-200"
            >
              <span className="w-8 h-8 rounded-lg flex items-center justify-center
                bg-red-50 text-red-500 shrink-0">
                <Icons.LogOut size={14} />
              </span>
              Logout
            </button>
          )}
        </div>

      </aside>
    </>
  );
};

export default Sidebar;