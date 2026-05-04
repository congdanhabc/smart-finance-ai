import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Định nghĩa các biến thể màu sắc hỗ trợ cả Light và Dark Mode
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-[13px] font-medium transition-colors",
  {
    variants: {
      variant: {
        // 1. Mặc định (Dành cho Phân loại như: Ngân hàng, Tiền mặt) - Khớp màu trong ảnh
        default:
          "bg-slate-100 text-slate-600 dark:bg-[#2A3143] dark:text-[#929EAE]",
        
        // 2. Thành công (Màu xanh lá)
        success:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
          
        // 3. Cảnh báo (Màu cam/vàng)
        warning:
          "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
          
        // 4. Lỗi / Xóa (Màu đỏ)
        destructive:
          "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
          
        // 5. Trong suốt (Dành cho Trạng thái có dấu chấm)
        ghost: 
          "bg-transparent text-slate-600 dark:text-[#929EAE] px-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  showDot?: boolean;   // Bật/tắt dấu chấm
  dotColor?: string;   // Ép màu dấu chấm (vd: "bg-[#C8EE44]")
}

function Badge({ className, variant, showDot = false, dotColor, children, ...props }: BadgeProps) {
  
  // Hàm tự động chọn màu dấu chấm nếu không truyền dotColor
  const getDotColor = () => {
    if (dotColor) return dotColor;
    if (variant === "success") return "bg-emerald-500";
    if (variant === "destructive") return "bg-red-500";
    if (variant === "warning") return "bg-orange-500";
    return "bg-[#C8EE44]"; // Mặc định màu vàng neon của app
  };

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {showDot && (
        <span
          className={cn("mr-2 h-2 w-2 rounded-full", getDotColor())}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }