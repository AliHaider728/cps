import { useState, useEffect } from "react";
import Sidebar from "./Sidebar/Sidebar.jsx";
import Header  from "./Header/Header.jsx";

const DashboardLayout = ({ children }) => {
  //  Desktop par true, mobile par false — window width check karke
  const [sidebarOpen,  setSidebarOpen]  = useState(() => window.innerWidth >= 768);
  const [isCollapsed,  setIsCollapsed]  = useState(false);
  const [isDark,       setIsDark]       = useState(false);

  //  Resize par bhi handle karo
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true); // desktop par hamesha open
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300
          ${isCollapsed ? "md:ml-[68px]" : "md:ml-[256px]"}`}
      >
        <Header
          //  Mobile par toggle karo (open/close), desktop par kuch mat karo
          onMenuClick={() => {
            if (window.innerWidth < 768) {
              setSidebarOpen(o => !o);
            }
          }}
          onThemeToggle={handleThemeToggle}
          isDark={isDark}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>

        <footer className="bg-white py-4 px-6 border-t border-slate-200 text-center text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()}{" "}
          <span className="text-blue-600 font-semibold">Core Prescribing Solutions</span>
          · Designed by{" "}
          <span className="text-blue-600 font-semibold">TecnoSphere</span>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;