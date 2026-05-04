import { LayoutDashboard, ArrowRightLeft, Receipt, WalletCards, Settings, Sparkles } from "lucide-react";

export const MAIN_NAV =[
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/category", label: "Danh mục", icon: Receipt },
  { path: "/transaction", label: "Giao dịch", icon: ArrowRightLeft },
  { path: "/wallet", label: "Ví tiền", icon: WalletCards },
  { path: "/ai-chat", label: "Trợ lý AI", icon: Sparkles }, 
];

export const BOTTOM_NAV =[
  { path: "/setting", label: "Cài đặt", icon: Settings },
];