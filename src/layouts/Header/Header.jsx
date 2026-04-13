import { useState, useRef, useEffect } from "react";
import {
  Menu, Bell, Sun, Moon, Search, LogOut, User,
  Calendar, ShieldCheck, Settings, BarChart2,
  AlertTriangle, GraduationCap,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

// ── Mock notifications (move to parent/context when ready) ────
const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    tab: "rota",
    read: false,
    icon: <Calendar size={15} />,
    iconBg: "#eff6ff",
    iconColor: "#1d4ed8",
    title: "Rota published — week 16",
    desc: "Your schedule for Apr 14–20 is live.",
    time: "2 min ago",
    tag: "Rota",
    tagColor: "#1d4ed8",
    tagBg: "#dbeafe",
  },
  {
    id: 2,
    tab: "compliance",
    read: false,
    icon: <AlertTriangle size={15} />,
    iconBg: "#fff7ed",
    iconColor: "#c2410c",
    title: "DBS renewal due in 7 days",
    desc: "Certificate expires 17 Apr — upload renewal.",
    time: "1 hr ago",
    tag: "Urgent",
    tagColor: "#c2410c",
    tagBg: "#ffedd5",
  },
  {
    id: 3,
    tab: "pcn",
    read: false,
    icon: <BarChart2 size={15} />,
    iconBg: "#faf5ff",
    iconColor: "#6d28d9",
    title: "PCN dashboard updated",
    desc: "Q1 metrics uploaded by Network Manager.",
    time: "3 hrs ago",
    tag: "PCN",
    tagColor: "#6d28d9",
    tagBg: "#ede9fe",
  },
  {
    id: 4,
    tab: "compliance",
    read: true,
    icon: <GraduationCap size={15} />,
    iconBg: "#f0fdf4",
    iconColor: "#15803d",
    title: "Training module assigned",
    desc: "Complete 'Medicines Optimisation' by 30 Apr.",
    time: "Yesterday",
    tag: "Training",
    tagColor: "#15803d",
    tagBg: "#dcfce7",
  },
];

const NOTIF_TABS = ["all", "rota", "compliance", "pcn"];

const Header = ({ onMenuClick, onThemeToggle, isDark }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Internal notification state
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [activeTab,   setActiveTab]   = useState("all");
  const [query,       setQuery]       = useState("");

  const notifRef   = useRef(null);
  const profileRef = useRef(null);
  const searchRef  = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!notifRef.current?.contains(e.target))   setNotifOpen(false);
      if (!profileRef.current?.contains(e.target)) setProfileOpen(false);
      if (!searchRef.current?.contains(e.target))  setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.tab === activeTab);

  const tabCounts = {
    all:        notifications.length,
    rota:       notifications.filter((n) => n.tab === "rota").length,
    compliance: notifications.filter((n) => n.tab === "compliance").length,
    pcn:        notifications.filter((n) => n.tab === "pcn").length,
  };

  const QUICK_LINKS = [
    { label: "Rota management",    sub: "View & manage staff schedules",  icon: <Calendar size={14} />,    color: "#1d4ed8", bg: "#eff6ff", path: "/rota"       },
    { label: "Compliance tracker", sub: "DBS, training & certifications", icon: <ShieldCheck size={14} />, color: "#15803d", bg: "#f0fdf4", path: "/compliance"  },
    { label: "PCN dashboard",      sub: "Performance metrics & KPIs",     icon: <BarChart2 size={14} />,   color: "#6d28d9", bg: "#faf5ff", path: "/pcn"        },
    { label: "Staff records",      sub: "Employee profiles & documents",  icon: <User size={14} />,        color: "#c2410c", bg: "#fff7ed", path: "/staff"       },
  ].filter(
    (l) => !query || l.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleMarkAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const handleNotifClick = (n) =>
    setNotifications((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
    );

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap');
        .hdr-fn { font-family: 'Nunito', sans-serif; }
        .ni-desc-clip { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .hdr-dropdown { animation: hdrFadeIn 0.15s ease; }
        @keyframes hdrFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hdr-notif-item:hover { background: #f8faff; }
        .dark .hdr-notif-item:hover { background: rgba(37,99,235,0.08); }
        .ntab-active { background: #eff6ff !important; color: #2563eb !important; }
      `}</style>

      <header className="hdr-fn sticky top-0 z-40 bg-white border-b border-slate-200 h-16 px-4 sm:px-6 flex items-center justify-between shadow-sm">

        {/* LEFT — hamburger + search */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div ref={searchRef} className="relative hidden sm:block">
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 w-60 cursor-text">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search rota, staff, PCN…"
                className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
              />
            </div>

            {searchOpen && (
              <div className="hdr-dropdown absolute top-[calc(100%+8px)] left-0 w-72 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden z-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 pt-3 pb-1">
                  Quick links
                </p>
                {QUICK_LINKS.map((l) => (
                  <div
                    key={l.path}
                    onClick={() => { navigate(l.path); setSearchOpen(false); setQuery(""); }}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: l.bg, color: l.color }}
                    >
                      {l.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{l.label}</p>
                      <p className="text-xs text-slate-400">{l.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — theme, notifications, profile */}
        <div className="flex items-center gap-1.5">

          {/* Theme toggle */}
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => { setNotifOpen((o) => !o); setProfileOpen(false); }}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors relative"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="hdr-dropdown absolute right-0 top-[calc(100%+10px)] w-[360px] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-800">Notifications</span>
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    Mark all read
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 px-4 pt-2 border-b border-slate-100">
                  {NOTIF_TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-t-lg capitalize transition-colors ${
                        activeTab === tab
                          ? "ntab-active"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {tab === "all"
                        ? `All (${tabCounts.all})`
                        : `${tab.charAt(0).toUpperCase() + tab.slice(1)} (${tabCounts[tab]})`}
                    </button>
                  ))}
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                  {filtered.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 py-10">
                      No notifications
                    </p>
                  ) : (
                    filtered.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotifClick(n)}
                        className={`hdr-notif-item flex gap-3 px-4 py-3 cursor-pointer transition-colors relative ${
                          !n.read ? "bg-blue-50/30" : ""
                        }`}
                      >
                        {!n.read && (
                          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-600" />
                        )}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: n.iconBg, color: n.iconColor }}
                        >
                          {n.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 mb-0.5">{n.title}</p>
                          <p className="ni-desc-clip text-xs text-slate-500 mb-1">{n.desc}</p>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                              style={{ color: n.tagColor, background: n.tagBg }}
                            >
                              {n.tag}
                            </span>
                            <span className="text-[10px] text-slate-400">{n.time}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-slate-100 px-4 py-2.5 text-center">
                  <button
                    onClick={() => navigate("/notifications")}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    View all notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-7 bg-slate-200 mx-1" />

          {/* Profile */}
          {user && (
            <div ref={profileRef} className="relative">
              <div
                onClick={() => { setProfileOpen((o) => !o); setNotifOpen(false); }}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-800 leading-tight">{user.name}</span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {user.role?.replace("_", " ")}
                  </span>
                </div>
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                </div>
              </div>

              {profileOpen && (
                <div className="hdr-dropdown absolute right-0 top-[calc(100%+10px)] w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-400 capitalize">
                        {user.role?.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  <div className="py-1.5">
                    {[
                      { label: "My profile",        icon: <User size={14} />,        path: "/profile"    },
                      { label: "My rota",           icon: <Calendar size={14} />,    path: "/rota"       },
                      { label: "Compliance status", icon: <ShieldCheck size={14} />, path: "/compliance" },
                      { label: "Account settings",  icon: <Settings size={14} />,    path: "/settings"   },
                    ].map((item) => (
                      <div
                        key={item.path}
                        onClick={() => { navigate(item.path); setProfileOpen(false); }}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer transition-colors"
                      >
                        {item.icon}
                        {item.label}
                      </div>
                    ))}
                    <hr className="my-1 border-slate-100" />
                    <div
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                    >
                      <LogOut size={14} />
                      Sign out
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;