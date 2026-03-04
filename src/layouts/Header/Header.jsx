import { Menu, Bell, Sun, Moon, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Header = ({ onMenuClick, onThemeToggle, isDark }) => {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 w-56">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input type="text" placeholder="Search…" className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onThemeToggle} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role?.replace("_", " ")}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
