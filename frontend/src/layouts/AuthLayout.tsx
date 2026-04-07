import { Outlet } from "react-router-dom";
import bgImg from "@/assets/image/authBackground.svg"


interface AuthLayoutProps {
  dark?: boolean;
}

export default function AuthLayout({ dark = false }: AuthLayoutProps) {
  return (
    <main className={`min-h-screen flex w-full ${dark ? "bg-[#1C1A2E]" : "bg-white"}`}>
      
      {/* Left panel */}
      <div className="flex-1 flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-125 px-8 sm:px-14 lg:px-16 py-10"> 
            <Outlet />
          </div>
        </div>
      </div>

      {/* Right panel - image */}
      <div className="hidden lg:block lg:w-[47%] xl:w-[46%] relative shrink-0">
        <img
          src={bgImg}
          alt="Decorative"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1B212D] opacity-10" />
      </div>

    </main>
  );
}