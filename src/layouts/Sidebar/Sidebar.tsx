/**
 * Sidebar.tsx — Upgraded UI
 * Features:
 * - Hover auto-expand (collapsed mode)
 * - Dark mode support
 * - Collapse toggle button
 * - Enhanced visual polish
 */
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import * as Icons from "lucide-react";
import { useState, useEffect, ReactNode, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import { sidebarConfig } from "../../data/sidebarConfig";

// ── Role metadata ──────────────────────────────────────────────────────────────
interface RoleMeta {
  label: string;
  color: string;
}

const ROLE_META: Record<string, RoleMeta> = {
  super_admin: { label: "Super Admin",    color: "#ef4444" },
  director:    { label: "Director",       color: "#8b5cf6" },
  ops_manager: { label: "Ops Manager",    color: "#f97316" },
  finance:     { label: "Finance",        color: "#eab308" },
  training:    { label: "Training & Dev", color: "#22c55e" },
  workforce:   { label: "Workforce / VA", color: "#06b6d4" },
  clinician:   { label: "Clinician",      color: "#64748b" },
};

// ── Dynamic Icon ───────────────────────────────────────────────────────────────
interface DynIconProps {
  name: string;
  size?: number;
}
const DynIcon = ({ name, size = 16 }: DynIconProps) => {
  const Icon = (Icons as any)[name] || Icons.Circle;
  return <Icon size={size} />;
};

// ── Tooltip (collapsed mode only) ─────────────────────────────────────────────
interface TooltipProps {
  label: string;
  children: ReactNode;
}
const Tooltip = ({ label, children }: TooltipProps) => (
  <div className="relative group/tip">
    {children}
    <div className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2
      translate-x-3 opacity-0 group-hover/tip:translate-x-0 group-hover/tip:opacity-100
      transition-all duration-200 z-[9999] whitespace-nowrap
      bg-slate-900 text-white text-[11.5px] font-semibold
      px-3 py-1.5 rounded-lg shadow-2xl border border-slate-700/50">
      {label}
      <span className="absolute right-full top-1/2 -translate-y-1/2
        border-[5px] border-transparent border-r-slate-900" />
    </div>
  </div>
);

export interface NavItemData {
  label: string;
  path: string;
  icon: string;
  children?: NavItemData[];
}

// ── Nav Item ───────────────────────────────────────────────────────────────────
interface NavItemProps {
  item: NavItemData;
  isCollapsed: boolean;
  hoverExpanded: boolean;
  closeDrawer: () => void;
  depth?: number;
}

const NavItem = ({ item, isCollapsed, hoverExpanded, closeDrawer, depth = 0 }: NavItemProps) => {
  const location    = useLocation();
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;

  const isParentActive = hasChildren && item.children!.some(
    (c) => location.pathname === c.path || location.pathname.startsWith(c.path + "/")
  );

  const [open, setOpen] = useState(isParentActive);
  useEffect(() => { if (isParentActive) setOpen(true); }, [isParentActive]);

  const showExpanded = !isCollapsed || hoverExpanded;

  const handleClick = (e: ReactMouseEvent | ReactKeyboardEvent) => {
    if (hasChildren) { e.preventDefault(); setOpen((o) => !o); }
    else closeDrawer();
  };

  const Inner = ({ isActive }: { isActive: boolean }) => {
    const active = isActive || isParentActive;
    return (
      <>
        {/* Active indicator bar */}
        <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full
          transition-all duration-300 ease-out
          ${active
            ? "h-[60%] opacity-100 bg-blue-600"
            : "h-0 opacity-0 bg-blue-600"}`} />

        {/* Icon container */}
        <span className={`relative flex items-center justify-center rounded-[10px] shrink-0
          transition-all duration-200
          ${depth > 0 ? "w-5 h-5" : "w-[34px] h-[34px]"}
          ${active
            ? "bg-gradient-to-br from-blue-500/15 to-blue-600/20 text-blue-600 shadow-[0_0_0_1px_rgba(59,130,246,0.25)]"
            : "text-slate-400 group-hover/item:bg-slate-100/80 group-hover/item:text-slate-600"}`}>
          <DynIcon name={item.icon} size={depth > 0 ? 13 : 15} />
          {/* Active dot for depth-0 active icons */}
          {active && depth === 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-blue-500
              shadow-[0_0_4px_rgba(59,130,246,0.8)]" />
          )}
        </span>

        {/* Label */}
        {showExpanded && (
          <span className={`flex-1 text-[13px] leading-tight truncate transition-colors duration-200
            ${active
              ? "text-blue-700 font-semibold"
              : "text-slate-600 font-medium group-hover/item:text-slate-800"}`}>
            {item.label}
          </span>
        )}

        {/* Chevron for parent */}
        {showExpanded && hasChildren && (
          <Icons.ChevronRight size={12}
            className={`shrink-0 text-slate-350 transition-all duration-300 ease-out
              ${open ? "rotate-90 text-blue-500" : "text-slate-400"}`} />
        )}
      </>
    );
  };

  const baseClass = `group/item relative flex items-center gap-2.5 w-full rounded-xl
    transition-all duration-200 cursor-pointer select-none
    border border-transparent
    hover:bg-slate-50/90 hover:border-slate-200/80
    active:scale-[0.99]
    ${depth > 0 ? "py-[7px] pl-3 pr-2 my-[1px]" : "py-[8px] px-[7px] my-[2px]"}
    ${!showExpanded ? "justify-center !p-2.5" : ""}`;

  const activeClass = "bg-blue-50/90 border-blue-200/50 hover:bg-blue-50 hover:border-blue-200/60";

  const node = hasChildren ? (
    <div
      className={`${baseClass} ${(open || isParentActive) ? activeClass : ""}`}
      onClick={handleClick as any} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick(e)}
    >
      <Inner isActive={false} />
    </div>
  ) : (
    <NavLink
      to={item.path}
      onClick={handleClick as any}
      end={item.path === "/dashboard/super-admin/clients"}
      className={({ isActive }) => `${baseClass} ${isActive ? activeClass : ""}`}
    >
      {({ isActive }) => <Inner isActive={isActive} />}
    </NavLink>
  );

  const childrenHeight = hasChildren && item.children ? item.children.length * 38 : 0;

  return (
    <li className="list-none">
      {isCollapsed && !hoverExpanded ? <Tooltip label={item.label}>{node}</Tooltip> : node}

      {/* Animated children */}
      {hasChildren && showExpanded && (
        <div
          className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]"
          style={{ maxHeight: open ? `${childrenHeight + 20}px` : "0px", opacity: open ? 1 : 0 }}
        >
          <div className="relative pl-[18px] mt-0.5 pb-1.5 pr-1">
            {/* Connector line */}
            <div className="absolute left-[22px] top-0 bottom-2 w-px
              bg-gradient-to-b from-blue-200/60 via-slate-200 to-transparent rounded-full" />
            <ul className="space-y-0">
              {item.children!.map((child, i) => (
                <NavItem
                  key={i} item={child}
                  isCollapsed={false} hoverExpanded={false}
                  closeDrawer={closeDrawer} depth={1}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
};

export interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean | ((prev: boolean) => boolean)) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean | ((prev: boolean) => boolean)) => void;
  isDark: boolean;
}

// ── Main Sidebar ───────────────────────────────────────────────────────────────
const Sidebar = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed, isDark }: SidebarProps) => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const sections: { section: string, items: NavItemData[] }[] = (sidebarConfig as any)[user?.role || ''] || [];
  const role             = ROLE_META[user?.role || ''] || ROLE_META.clinician;

  const [hoverExpanded, setHoverExpanded] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const showExpanded = !isCollapsed || hoverExpanded;
  const sidebarWidth = showExpanded ? 260 : 70;

  const bg       = isDark ? "bg-slate-900"   : "bg-white";
  const border   = isDark ? "border-slate-800" : "border-slate-200/80";
  const textMid  = isDark ? "text-slate-500"  : "text-slate-400";

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full z-40
          transition-[width,transform] duration-[300ms] ease-[cubic-bezier(.4,0,.2,1)]
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{ width: sidebarWidth }}
        onMouseEnter={() => { if (isCollapsed) setHoverExpanded(true);  }}
        onMouseLeave={() => { if (isCollapsed) setHoverExpanded(false); }}
      >
        <aside className={`h-full w-full flex flex-col border-r ${bg} ${border}
          shadow-[8px_0_40px_rgba(15,23,42,0.07)]`}>

          {/* ── Subtle top accent ── */}
          <div className="absolute top-0 left-0 right-0 h-[2px]
            bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400 opacity-70 z-10" />

          {/* ── Logo ── */}
          <div className={`flex items-center shrink-0 border-b h-[62px] relative
            ${isDark ? "border-slate-800" : "border-slate-100"}
            ${showExpanded ? "px-3.5 gap-2.5" : "justify-center px-2"}`}>

            {showExpanded ? (
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center
                    bg-gradient-to-br from-blue-50 to-indigo-50"
                    style={{ boxShadow: "0 2px 10px rgba(59,130,246,0.2), 0 0 0 1px rgba(59,130,246,0.1)" }}>
                    <img
                      src="https://coreprescribingsolutions.co.uk/wp-content/themes/core-prescribing/images/core-prescribing-logo.png"
                      alt="CPS" className="w-7 h-7 object-contain"
                    />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                    style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e90" }} />
                </div>
                <div className="min-w-0">
                  <p className={`text-[13.5px] font-bold leading-tight truncate
                    ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                    Core Prescribing
                  </p>
                  <p className="text-[10.5px] font-semibold leading-tight truncate tracking-widest text-blue-500/70 uppercase">
                    Solutions
                  </p>
                </div>
              </div>
            ) : (
              <Tooltip label="Core Prescribing Solutions">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center cursor-default
                  hover:scale-105 transition-transform duration-200"
                  style={{
                    background: "linear-gradient(135deg,#eff6ff,#eef2ff)",
                    boxShadow: "0 2px 10px rgba(59,130,246,0.18), 0 0 0 1px rgba(59,130,246,0.1)"
                  }}>
                  <img
                    src="https://coreprescribingsolutions.co.uk/wp-content/themes/core-prescribing/images/core-prescribing-logo.png"
                    alt="CPS" className="w-7 h-7 object-contain"
                  />
                </div>
              </Tooltip>
            )}

            {/* Collapse toggle (desktop) */}
            {showExpanded && (
              <button
                onClick={() => setIsCollapsed((c) => !c)}
                className={`hidden md:flex w-7 h-7 rounded-lg items-center justify-center shrink-0
                  border transition-all duration-200 group/collapse
                  ${isDark
                    ? "border-slate-700 text-slate-500 hover:bg-slate-800 hover:text-slate-300 hover:border-slate-600"
                    : "border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 hover:border-slate-300"}`}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <Icons.PanelLeftClose size={13} className="group-hover/collapse:scale-110 transition-transform duration-150" />
              </button>
            )}

            {/* Mobile close */}
            <button
              onClick={() => setIsOpen(false)}
              className={`md:hidden w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                border transition-all duration-200
                ${isDark
                  ? "border-slate-700 text-slate-400 hover:bg-slate-700"
                  : "border-slate-200 text-slate-400 hover:bg-slate-100"}`}
            >
              <Icons.X size={14} />
            </button>

            {/* Collapsed: show expand button */}
            {!showExpanded && (
              <button
                onClick={() => setIsCollapsed(false)}
                className={`hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2
                  w-6 h-6 rounded-full items-center justify-center
                  border shadow-md transition-all duration-200 z-20
                  ${isDark
                    ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                    : "bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:shadow-lg"}`}
                title="Expand sidebar"
              >
                <Icons.ChevronRight size={11} />
              </button>
            )}
          </div>

          {/* ── User card ── */}
          {user && (
            <div className={`px-2.5 py-2.5 shrink-0 border-b ${isDark ? "border-slate-800" : "border-slate-100"}`}>
              {!showExpanded ? (
                <Tooltip label={`${user.name} · ${role.label}`}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto
                    text-sm font-bold text-white cursor-default hover:scale-105 transition-transform duration-200"
                    style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", boxShadow: "0 3px 12px rgba(99,102,241,.35)" }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                </Tooltip>
              ) : (
                <div className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl
                  transition-all duration-200 group/user cursor-default
                  ${isDark
                    ? "bg-slate-800/80 hover:bg-slate-800"
                    : "bg-gradient-to-br from-slate-50 to-slate-100/60 hover:from-slate-100 hover:to-slate-100/80"}
                  border ${isDark ? "border-slate-700/50" : "border-slate-200/60"}`}>
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center
                      text-[15px] font-bold text-white"
                      style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", boxShadow: "0 3px 12px rgba(99,102,241,.3)" }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2
                      border-white"
                      style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e90" }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[12.5px] font-semibold truncate leading-tight
                      ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                      {user.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-[3px]">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 shadow-sm"
                        style={{ background: role.color, boxShadow: `0 0 4px ${role.color}80` }} />
                      <span className="text-[10.5px] font-semibold truncate tracking-wide"
                        style={{ color: role.color }}>
                        {role.label}
                      </span>
                    </div>
                  </div>
                  <Icons.MoreHorizontal size={14}
                    className={`shrink-0 opacity-0 group-hover/user:opacity-100 transition-opacity duration-200
                      ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                </div>
              )}
            </div>
          )}

          {/* ── Navigation ── */}
          <nav className={`flex-1 overflow-y-auto py-2 px-2
            [scrollbar-width:thin]
            ${isDark
              ? "[scrollbar-color:#334155_transparent] [&::-webkit-scrollbar-thumb]:bg-slate-700"
              : "[scrollbar-color:#e2e8f0_transparent] [&::-webkit-scrollbar-thumb]:bg-slate-200"}
            [&::-webkit-scrollbar]:w-[3px]
            [&::-webkit-scrollbar-thumb]:rounded-full`}>

            {sections.map((sec, si) => (
              <div key={si} className={showExpanded ? "mb-2" : "mb-0"}>
                {showExpanded ? (
                  <div className="flex items-center gap-2 px-3 pt-3 pb-1.5">
                    <p className={`text-[9.5px] font-bold uppercase tracking-[.14em] ${textMid}`}>
                      {sec.section}
                    </p>
                    <div className={`flex-1 h-px ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
                  </div>
                ) : si > 0 ? (
                  <div className={`h-px mx-2 my-2.5 ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
                ) : null}

                <ul className="space-y-0">
                  {sec.items.map((item, ii) => (
                    <NavItem
                      key={ii} item={item}
                      isCollapsed={isCollapsed}
                      hoverExpanded={hoverExpanded}
                      closeDrawer={() => setIsOpen(false)}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* ── Bottom actions ── */}
          <div className={`shrink-0 px-2 pb-3 pt-2 border-t ${isDark ? "border-slate-800" : "border-slate-100/80"}
            ${isDark ? "bg-slate-900" : "bg-gradient-to-t from-slate-50/80 to-transparent"}`}>
            {!showExpanded ? (
              <Tooltip label="Logout">
                <button
                  onClick={handleLogout}
                  className={`w-full flex justify-center items-center py-2.5 rounded-xl
                    transition-all duration-200 group/logout
                    ${isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-400 hover:bg-red-50 hover:text-red-500"}`}
                >
                  <Icons.LogOut size={15} className="group-hover/logout:translate-x-0.5 transition-transform duration-150" />
                </button>
              </Tooltip>
            ) : (
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-2.5 px-2.5 py-[9px] rounded-xl
                  text-[12.5px] font-semibold transition-all duration-200 group/logout
                  border border-transparent
                  ${isDark
                    ? "text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
                    : "text-red-500 hover:bg-red-50 hover:border-red-100"}`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200
                  ${isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-500"}`}>
                  <Icons.LogOut size={14}
                    className="group-hover/logout:translate-x-0.5 transition-transform duration-150" />
                </span>
                <span>Logout</span>
              </button>
            )}
          </div>

        </aside>
      </div>
    </>
  );
};

export default Sidebar;
