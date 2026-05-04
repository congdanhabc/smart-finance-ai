import type { ColumnDef } from "@tanstack/react-table";
import type { Transaction } from "@/type/transaction.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useDeleteTransaction } from "@/hooks/query/transaction";
import type { FilterConfig } from "@/type/table.type";
import { toast } from "sonner";
import { useGetWallets } from "@/hooks/query/wallet";
import { useGetCategories } from "@/hooks/query/category";

interface UseTransactionTableProps {
  handleEdit: (transaction: Transaction) => void;
}

export default function useTransactionTable({ handleEdit }: UseTransactionTableProps) {
  const { mutateAsync: deleteTransaction } = useDeleteTransaction();

  const { data: walletsData } = useGetWallets({ page: 1, size: 50 });
  const { data: categoriesData } = useGetCategories({ page: 1, size: 50 });

  const walletOptions = (walletsData?.data ||[]).map(w => ({ label: w.name, value: w.id }));
  const categoryOptions = (categoriesData?.data ||[]).map(c => ({ label: c.name, value: c.id }));

  const filterConfigs: FilterConfig[] =[
    {
      key: "type",
      label: "Loại giao dịch",
      type: "select",
      className: "w-[140px]",
      options:[
        { label: "Chi tiêu", value: "EXPENSE" },
        { label: "Thu nhập", value: "INCOME" },
        { label: "Chuyển khoản", value: "TRANSFER" },
      ],
    },
    {
        key: "date_range",
        label: "Khoảng thời gian",
        type: "date-range",
        className: "w-[220px]",
    },
    {
      key: "wallet_id",
      label: "Tất cả ví",
      type: "select",
      className: "w-[160px]",
      options: walletOptions,
    },
    {
      key: "category_id",
      label: "Tất cả danh mục",
      type: "select",
      className: "w-[160px]",
      options: categoryOptions,
    },   
  ];

  const columns: ColumnDef<Transaction>[] =[
    {
      accessorKey: "description",
      header: "Chi tiết giao dịch",
      cell: ({ row }) => {
        const tx = row.original;
        const desc = tx.description || (tx.type === "TRANSFER" ? "Chuyển tiền nội bộ" : "Giao dịch không có ghi chú");
        
        return (
          <div className="flex flex-col min-w-37.5">
            <span className="text-[15px] font-bold text-[#1B212D] dark:text-white truncate max-w-62.5">
              {desc}
            </span>
            {tx.type !== "TRANSFER" && (
              <span className="text-[13px] text-[#78778B] mt-0.5 font-medium">
                {tx.category ? `${tx.category.icon || ""} ${tx.category.name}` : "---"}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "wallet_info",
      header: "Tài khoản / Ví",
      cell: ({ row }) => {
        const tx = row.original;

        if (tx.type === "TRANSFER") {
          return (
            <div className="flex flex-col gap-1.5 min-w-30">
              <div className="flex items-center gap-1.5 text-[13px] text-[#78778B]">
                <ArrowUpRight className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="truncate max-w-30">{tx.wallet?.name || "N/A"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[14px] font-medium text-[#1B212D] dark:text-white">
                <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate max-w-30">{tx.wallet_to?.name || "N/A"}</span>
              </div>
            </div>
          );
        }

        return (
          <div className="text-[14px] font-medium text-[#1B212D] dark:text-white">
            {tx.wallet?.name || "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Phân loại",
      cell: ({ row }) => {
        const type = row.original.type;
        if (type === "INCOME") return <Badge variant="success" showDot>Thu nhập</Badge>;
        if (type === "EXPENSE") return <Badge variant="destructive" showDot>Chi tiêu</Badge>;
        return <Badge variant="default" showDot dotColor="bg-blue-500">Chuyển khoản</Badge>;
      },
    },
    {
      accessorKey: "amount",
      header: "Số tiền",
      cell: ({ row }) => {
        const { type, amount } = row.original;
        const formatted = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
        
        let colorClass = "text-[#1B212D] dark:text-white";
        let prefix = "";
        
        if (type === "INCOME") { colorClass = "text-emerald-500"; prefix = "+"; }
        if (type === "EXPENSE") { colorClass = "text-red-500"; prefix = "-"; }

        return <span className={`text-[15px] font-bold ${colorClass}`}>{prefix} {formatted}</span>;
      },
    },
    {
      accessorKey: "transaction_date",
      header: "Thời gian",
      cell: ({ row }) => {
        const date = new Date(row.original.transaction_date);
        return (
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-[#1B212D] dark:text-white">
              {date.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
            <span className="text-[12px] text-[#78778B]">
              {date.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Hành động</div>,
      cell: ({ row }) => {
        const tx = row.original;

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 text-[#78778B] hover:text-[#1B212D] dark:hover:text-white">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-2xl bg-white dark:bg-[#1C1A2E] border-[#F2F2F2] dark:border-[#2A3143]">
                <DropdownMenuItem onClick={() => handleEdit(tx)} className="cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" /> Sửa giao dịch
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <ConfirmModal
                  title="Xóa giao dịch này?"
                  description="Hành động này sẽ xóa giao dịch và tự động hoàn trả số dư lại cho các ví liên quan."
                  onConfirm={async () => {
                    try {
                      await deleteTransaction(tx.id);
                      toast.success("Đã xóa giao dịch và hoàn tiền thành công.");
                    } catch (error: any) {
                      toast.error(error.response?.data?.detail || "Có lỗi xảy ra.");
                    }
                  }}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer text-red-600 focus:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-2" /> Xóa bản ghi
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