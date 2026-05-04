import type { ColumnDef } from "@tanstack/react-table";
import type { Category } from "@/type/category.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useDeleteCategory } from "@/hooks/query/category";
import type { FilterConfig } from "@/type/table.type";
import { toast } from "sonner";

interface UseCategoryTableProps {
  handleEdit: (category: Category) => void;
}

export default function useCategoryTable({ handleEdit }: UseCategoryTableProps) {
  const { mutateAsync: deleteCategory } = useDeleteCategory();

  const filterConfigs: FilterConfig[] =[
    {
      key: "type",
      label: "Tất cả phân loại",
      type: "select",
      options:[
        { label: "Khoản Chi", value: "EXPENSE" },
        { label: "Khoản Thu", value: "INCOME" },
      ],
      className: "w-[160px]",
    },
  ];


  const columns: ColumnDef<Category>[] =[
    {
      accessorKey: "name",
      header: "Tên danh mục",
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl shadow-sm border border-[#F2F2F2] dark:border-[#2A3143]"
              style={{ backgroundColor: `${category.color}20` || "#F8F9FB" }}
            >
              {category.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-[#1B212D] dark:text-white">
                {category.name}
              </span>
              <span className="text-[13px] font-medium text-[#78778B] uppercase">
                ID: {category.id}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Phân loại",
      cell: ({ row }) => {
        const type = row.original.type;
        const isExpense = type === "EXPENSE";
        return (
          <Badge 
            variant="ghost" 
            showDot 
            dotColor={isExpense ? "bg-red-500" : "bg-emerald-500"}
          >
            {isExpense ? "Khoản chi" : "Khoản thu"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "color",
      header: "Mã màu",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full border border-gray-200" 
            style={{ backgroundColor: row.original.color || "#ccc" }} 
          />
          <span className="text-sm font-medium text-[#78778B] uppercase">
            {row.original.color || "N/A"}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Hành động</div>,
      cell: ({ row }) => {
        const category = row.original;

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 text-[#78778B] hover:text-[#1B212D] dark:hover:text-white">
                  <span className="sr-only">Mở menu</span>
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-48 rounded-2xl bg-white dark:bg-[#1C1A2E] border-[#F2F2F2] dark:border-[#2A3143]">
                <DropdownMenuLabel className="text-[12px] font-bold text-[#929EAE] uppercase px-2 py-1.5">
                  Thao tác
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#F2F2F2] dark:bg-[#2A3143]" />

                <DropdownMenuItem 
                  onClick={() => handleEdit(category)}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg hover:bg-[#F8F9FB] dark:hover:bg-[#2A3143] text-[#1B212D] dark:text-white font-medium"
                >
                  <Edit className="h-4 w-4 text-[#78778B]" />
                  Sửa thông tin
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-[#F2F2F2] dark:bg-[#2A3143]" />

                <ConfirmModal
                  title="Xóa danh mục này?"
                  description={`Hành động này sẽ xóa danh mục "${category.name}". Bạn không thể xóa nếu đang có giao dịch sử dụng danh mục này.`}
                  onConfirm={async () => {
                    try {
                      await deleteCategory(category.id);
                      toast.success("Đã xóa danh mục thành công.");
                    } catch (error: any) {
                      const msg = error.response?.data?.detail || "Có lỗi xảy ra khi xóa.";
                      toast.error("Không thể xóa", { description: msg });
                      console.error("Lỗi xóa danh mục:", error);
                    }
                  }}
                  trigger={
                    <DropdownMenuItem 
                      onSelect={(e) => e.preventDefault()} 
                      className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 font-medium"
                    >
                      <Trash2 className="h-4 w-4" />
                      Xóa danh mục
                    </DropdownMenuItem>
                  }
                />

              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return { columns, filterConfigs };
}