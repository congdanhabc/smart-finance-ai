import { 
  LayoutDashboard, ArrowRightLeft, Receipt, WalletCards, Settings 
} from "lucide-react";

export const MAIN_NAV =[
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/transactions", label: "Transactions", icon: ArrowRightLeft },
  { path: "/invoices", label: "Invoices", icon: Receipt },
  { path: "/wallets", label: "My Wallets", icon: WalletCards },
];

export const BOTTOM_NAV =[
  { path: "/settings", label: "Settings", icon: Settings },
];