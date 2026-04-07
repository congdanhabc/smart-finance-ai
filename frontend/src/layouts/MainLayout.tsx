// src/layouts/MainLayout.tsx
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import AppSidebar from "./AppSidebar";
import AppTopbar from "./AppTopbar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BOTTOM_NAV, MAIN_NAV } from "@/routes/navigation";
import { useAuthStore } from "@/store/auth";

export default function MainLayout() {
  // Lấy title page
  const location = useLocation();
  const currentPath = location.pathname;

  const allNavItems =[...MAIN_NAV, ...BOTTOM_NAV];
  const activeItem = allNavItems.find(item => {
    if (item.path === "/") return currentPath === "/";
    return currentPath.startsWith(item.path);
  });

  // Lấy User từ Store
  const user = useAuthStore(state => state.user);

  // Config Dark theme
  const[isDark, setIsDark] = useState(() => {
    return localStorage.getItem("maglo-theme") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("maglo-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("maglo-theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-white dark:bg-[#1C1A2E] overflow-hidden font-sans">
        
        <AppSidebar isDark={isDark} onToggleTheme={toggleTheme} />

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center">
            <div className="md:hidden px-4">
              <SidebarTrigger />
            </div>
            
            <div className="flex-1">
              <AppTopbar title={activeItem?.label || ""} userName={user?.full_name || "User"} isDark={isDark} />
            </div>
          </div>

          <main className="flex-1 overflow-y-auto px-4 md:px-10 pb-10 pt-4 custom-scrollbar">
            <Outlet /> 
          </main>         
        </div>

      </div>
    </SidebarProvider>
  );
}