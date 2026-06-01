import { useState, useEffect } from "react";
import Sidebar from "./Sidebar/Sidebar.jsx";
import Header  from "./Header/Header.jsx";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDark,      setIsDark]      = useState(false);

  // Desktop par hamesha open rakho resize par
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(true);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Theme persist
  useEffect(() => {
    const saved = localStorage.getItem("cps_theme");
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleThemeToggle = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("cps_theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  // Effective sidebar width (accounts for hover-expand in Sidebar itself)
  // Layout only cares about collapsed vs expanded for margin
  const marginLeft = isCollapsed ? "md:ml-[68px]" : "md:ml-[256px]";

  return (
    <div className={`flex min-h-screen ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isDark={isDark}
      />

      {/* Main content — transitions with sidebar width */}
      <div className={`flex-1 flex flex-col transition-all duration-[280ms] ease-[cubic-bezier(.4,0,.2,1)] ${marginLeft}`}>
        <Header
          onMenuClick={() => {
            // Mobile: toggle drawer; Desktop: no-op (collapse handled in Header)
            if (window.innerWidth < 768) setSidebarOpen((o) => !o);
          }}
          onThemeToggle={handleThemeToggle}
          isDark={isDark}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 overflow-x-hidden overflow-y-auto min-w-0">
          {children}
        </main>

        <footer className={`py-4 px-4 sm:px-6 border-t text-center text-xs font-medium
          ${isDark ? "bg-slate-900 border-slate-800 text-slate-500" : "bg-white border-slate-200 text-slate-400"}`}>
          © {new Date().getFullYear()}{" "}
          <span className="text-blue-600 font-semibold">Core Prescribing Solutions</span>
          {" · "}Designed by{" "}
          <span className="text-blue-600 font-semibold">TecnoSphere</span>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;