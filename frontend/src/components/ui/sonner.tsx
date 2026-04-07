// src/components/ui/sonner.tsx
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          // Khung bao ngoài của Toast (Nền trắng, bo góc 10px, viền xám nhạt, bóng đổ nhẹ)
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:border-[#F2F2F2] group-[.toaster]:shadow-lg rounded-[10px] p-4 flex gap-3 w-full",
          
          // Tiêu đề (Màu xanh đen đậm, in đậm vừa)
          title: "text-[15px] font-semibold text-[#1B212D]",
          
          // Mô tả (Màu xám, chữ nhỏ hơn, dễ đọc - FIX LỖI TÀNG HÌNH Ở ĐÂY)
          description: "text-[14px] font-normal text-[#78778B] mt-1 group-[.toast]:text-[#78778B]",
          
          // Nút hành động (Ví dụ: Nút Undo)
          actionButton:
            "group-[.toast]:bg-[#C8EE44] group-[.toast]:text-[#1B212D] font-semibold rounded-[8px] px-3 py-1.5",
          
          // Nút Hủy
          cancelButton:
            "group-[.toast]:bg-[#F5F5F5] group-[.toast]:text-[#78778B] font-semibold rounded-[8px] px-3 py-1.5",
            
          // Icon lỗi (Tô màu đỏ cho icon X)
          error: "group-[.toaster]:text-red-500",
          
          // Icon thành công (Tô màu xanh lá đậm cho icon Check)
          success: "group-[.toaster]:text-[#82B440]",
          
          // Icon cảnh báo
          warning: "group-[.toaster]:text-orange-500",
          
          // Icon thông tin
          info: "group-[.toaster]:text-blue-500",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }