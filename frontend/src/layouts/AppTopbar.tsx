import { User } from "lucide-react";

export default function AppTopbar({title, userName }: {title: string, userName: string, isDark: boolean})
{
    return(
        <header className="flex items-center justify-between px-8 py-7.5 h-27">
          <h1 className="text-[25px] font-semibold text-maglo-text-1 dark:text-white">
            {title}
          </h1>
          <div className="flex items-center gap-11.25">
            <div className="flex items-center gap-3.75 px-1.75 pr-3.75 py-1.5 rounded-full bg-maglo-gray-1 dark:bg-maglo-dark-1">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white p-1 flex items-center justify-center text-black text-sm font-semibold shrink-0 overflow-hidden">
                    <User className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-semibold text-maglo-text-1 dark:text-white whitespace-nowrap">
                  {userName}
                </span>
              </div>
            </div>
          </div>
        </header>
    )
}