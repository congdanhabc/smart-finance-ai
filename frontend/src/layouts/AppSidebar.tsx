// src/components/AppSidebar.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Moon, Sun } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/auth";
import { BOTTOM_NAV, MAIN_NAV } from "@/routes/navigation";


interface AppSidebarProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function AppSidebar({ isDark, onToggleTheme }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();
  
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    logout(); // Xóa token
    navigate("/auth/login", { replace: true });
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className="bg-[#F8F9FB] dark:bg-[#1B212D] border-r border-[#F2F2F2] dark:border-[#2A3143]">
      
      {/* 1. KHOẢNG LOGO */}
      <SidebarHeader className="py-6 px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1B212D] dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-[#1B212D] font-bold text-xl italic">
            S
          </div>
          <span className="text-2xl font-bold text-[#1B212D] dark:text-white tracking-tight">Smart Finance</span>
        </div>
      </SidebarHeader>

      {/* 2. KHOẢNG MENU CHÍNH */}
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {MAIN_NAV.map((item) => {
              const active = isActive(item.path);
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={active}
                    onClick={() => setOpenMobile(false)}
                    // Custom CSS đè lên CSS mặc định của shadcn để lấy màu vàng neon
                    className={`h-12 text-[15px] font-semibold transition-all duration-200 ${
                      active 
                        ? "bg-[#C8EE44] text-[#1B212D] hover:bg-[#b8de34] hover:text-[#1B212D]" 
                        : "text-[#78778B] hover:bg-white dark:hover:bg-[#2A3143] hover:text-[#1B212D] dark:hover:text-white"
                    }`}
                  >
                    <Link to={item.path} className="flex items-center gap-3">
                      <item.icon size={20} className={active ? "text-[#1B212D]" : "text-[#929EAE]"} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* 3. KHOẢNG MENU DƯỚI CÙNG */}
      <SidebarFooter className="px-4 py-6 border-t border-[#F2F2F2] dark:border-[#2A3143]">
        <SidebarMenu className="gap-2">
          
          {/* Nút Đổi Theme */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={onToggleTheme}
              className="h-12 text-[15px] font-semibold text-[#78778B] hover:bg-white dark:hover:bg-[#2A3143] hover:text-[#1B212D] dark:hover:text-white"
            >
              <div className="flex items-center gap-3">
                {isDark ? <Sun size={20} className="text-[#929EAE]"/> : <Moon size={20} className="text-[#929EAE]"/>}
                <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Nút Help */}
          {BOTTOM_NAV.map((item) => {
            const active = isActive(item.path);

            return(
            <SidebarMenuItem key={item.path}>
                <SidebarMenuButton 
                    asChild 
                    isActive={active}
                    onClick={() => setOpenMobile(false)}
                    // Custom CSS đè lên CSS mặc định của shadcn để lấy màu vàng neon
                    className={`h-12 text-[15px] font-semibold transition-all duration-200 ${
                    active 
                        ? "bg-[#C8EE44] text-[#1B212D] hover:bg-[#b8de34] hover:text-[#1B212D]" 
                        : "text-[#78778B] hover:bg-white dark:hover:bg-[#2A3143] hover:text-[#1B212D] dark:hover:text-white"
                    }`}
                >
                    <Link to={item.path} className="flex items-center gap-3">
                    <item.icon size={20} className={active ? "text-[#1B212D]" : "text-[#929EAE]"} />
                    <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            )})}

          {/* Nút Logout */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="h-12 mt-2 text-[15px] font-semibold text-[#78778B] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <LogOut size={20} className="text-[#929EAE] group-hover:text-red-500" />
                <span>Đăng xuất</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

        </SidebarMenu>
      </SidebarFooter>
      
    </Sidebar>
  );
}