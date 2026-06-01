import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, Sun, Moon, LogOut, User, Settings, ChevronDown, X } from 'lucide-react';

const Header = ({ onMenuClick, onThemeToggle, isDark, user }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef   = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!profileRef.current?.contains(e.target)) setProfileOpen(false);
      if (!notifRef.current?.contains(e.target))   setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayName = user?.name || 'Admin';
  const displayRole = user?.role?.replace(/_/g, ' ') || 'Administrator';
  const initials    = displayName.charAt(0).toUpperCase();

  const iconBtn = (isDark) =>
    `flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200
    ${isDark
      ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent hover:border-slate-700'
      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`;

  return (
    <header
      className={`sticky top-0 z-30 h-[64px] flex items-center px-4 gap-3 transition-colors duration-300
        ${isDark
          ? 'bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 shadow-[0_1px_0_rgba(255,255,255,0.04)]'
          : 'bg-white/95 backdrop-blur-sm border-b border-slate-200/80 shadow-[0_2px_16px_rgba(15,23,42,0.05)]'}`}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]
        bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400 opacity-60" />

      {/* ── Mobile hamburger ── */}
      <button onClick={onMenuClick} className={`md:hidden ${iconBtn(isDark)}`}>
        <Menu size={19} />
      </button>

      {/* ── Page title (desktop) ── */}
      <div className="hidden md:flex flex-col justify-center flex-shrink-0">
        <h1 className={`text-[15px] font-bold leading-tight tracking-tight
          ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
          Admin Dashboard
        </h1>
        <p className={`text-[10.5px] font-semibold tracking-widest uppercase
          ${isDark ? 'text-slate-600' : 'text-blue-500/60'}`}>
          Core Prescribing Solutions
        </p>
      </div>

      {/* ── Divider ── */}
      <div className={`hidden md:block w-px h-6 flex-shrink-0 mx-1
        ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

      {/* ── Search ── */}
      <div className="flex-1 max-w-sm relative">
        <Search
          size={14}
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200
            ${searchFocused ? 'text-blue-500' : isDark ? 'text-slate-600' : 'text-slate-400'}`}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search staff, shifts, invoices…"
          className={`w-full h-9 pl-9 pr-8 text-[13px] rounded-xl border transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
            ${isDark
              ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-600 hover:border-slate-600'
              : 'bg-slate-50/80 border-slate-200 text-slate-800 placeholder-slate-400 hover:border-slate-300 hover:bg-white'}`}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className={`absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition-colors
              ${isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-700'
                       : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* ── Right actions ── */}
      <div className="flex items-center gap-1 ml-auto">

        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          title={isDark ? 'Light mode' : 'Dark mode'}
          className={`${iconBtn(isDark)} ${isDark ? '!text-amber-400 hover:!text-amber-300' : ''}`}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* ── Notifications ── */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className={`${iconBtn(isDark)} relative ${notifOpen
              ? isDark ? '!bg-slate-800 !border-slate-700 !text-slate-200' : '!bg-slate-100 !border-slate-200 !text-slate-700'
              : ''}`}
          >
            <Bell size={17} />
            <span className="absolute top-2 right-2 w-[7px] h-[7px] rounded-full bg-red-500
              ring-[1.5px] ring-white shadow-sm" />
          </button>

          {notifOpen && (
            <div
              className={`absolute right-0 top-[calc(100%+8px)] w-80 rounded-2xl border shadow-2xl overflow-hidden z-50
                ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
              style={{ animation: 'hdrFadeIn 0.15s ease' }}
            >
              <style>{`@keyframes hdrFadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
              <div className={`flex items-center justify-between px-4 py-3 border-b
                ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                <p className={`text-[13px] font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  Notifications
                </p>
                <span className="text-[10.5px] font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                  3 new
                </span>
              </div>
              {[
                { icon: "🗓️", text: "New shift request from Sarah M.", time: "2m ago",  unread: true  },
                { icon: "💊", text: "Prescription renewal due tomorrow.", time: "1h ago", unread: true  },
                { icon: "📋", text: "Invoice #1048 approved.",           time: "3h ago", unread: false },
              ].map((n, i) => (
                <div key={i}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors
                    ${n.unread
                      ? isDark ? 'bg-blue-500/5 hover:bg-blue-500/10' : 'bg-blue-50/60 hover:bg-blue-50'
                      : isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
                  <span className="text-lg shrink-0 mt-0.5">{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[12.5px] leading-snug
                      ${n.unread
                        ? isDark ? 'text-slate-200 font-medium' : 'text-slate-800 font-medium'
                        : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {n.text}
                    </p>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{n.time}</p>
                  </div>
                  {n.unread && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5
                      shadow-[0_0_4px_rgba(59,130,246,0.7)]" />
                  )}
                </div>
              ))}
              <div className={`px-4 py-2.5 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                <button className="w-full text-[12px] font-semibold text-blue-500 hover:text-blue-600 transition-colors">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div className={`w-px h-6 mx-1 flex-shrink-0 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

        {/* ── Profile dropdown ── */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className={`flex items-center gap-2 h-9 pl-1.5 pr-2.5 rounded-xl transition-all duration-200 border
              ${profileOpen
                ? isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                : isDark
                  ? 'border-transparent hover:bg-slate-800 hover:border-slate-700'
                  : 'border-transparent hover:bg-slate-50 hover:border-slate-200'}`}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0
              shadow-[0_2px_8px_rgba(99,102,241,0.35)]"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
              {initials}
            </div>
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className={`text-[12px] font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                {displayName}
              </span>
              <span className={`text-[10px] capitalize mt-[2px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {displayRole}
              </span>
            </div>
            <ChevronDown
              size={12}
              className={`flex-shrink-0 transition-transform duration-200
                ${profileOpen ? 'rotate-180' : ''}
                ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
            />
          </button>

          {profileOpen && (
            <div
              className={`absolute right-0 top-[calc(100%+8px)] w-56 rounded-2xl border shadow-2xl overflow-hidden z-50
                ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
              style={{ animation: 'hdrFadeIn 0.15s ease' }}
            >
              {/* User info */}
              <div className={`flex items-center gap-3 px-4 py-3.5 border-b
                ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50/70'}`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0
                  shadow-[0_2px_10px_rgba(99,102,241,0.35)]"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className={`text-[13px] font-bold truncate ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                    {displayName}
                  </p>
                  <p className={`text-[10.5px] capitalize truncate mt-[1px]
                    ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {displayRole}
                  </p>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                {[
                  { icon: User,     label: 'My Profile' },
                  { icon: Settings, label: 'Settings'   },
                ].map(({ icon: Icon, label }) => (
                  <button key={label}
                    className={`w-full flex items-center gap-3 px-4 py-[9px] text-[13px] transition-colors
                      ${isDark ? 'text-slate-300 hover:bg-slate-700/70' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center
                      ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon size={13} />
                    </span>
                    {label}
                  </button>
                ))}
              </div>

              <div className={`border-t py-1.5 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                <button className={`w-full flex items-center gap-3 px-4 py-[9px] text-[13px] font-medium
                  text-red-500 transition-colors
                  ${isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`}>
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center
                    ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-400'}`}>
                    <LogOut size={13} />
                  </span>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
