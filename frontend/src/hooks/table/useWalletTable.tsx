import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import type { Wallet } from "@/type/wallet.type";
import { CreditCard, Landmark, MoreVertical, Smartphone, Users, WalletIcon, Edit, Trash2 } from "lucide-react";
import type { FilterConfig } from "@/type/table.type";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useDeleteWallet } from "../query/wallet";
import { toast } from "sonner";

interface useWalletTableProps {
    handleEdit: (data: Wallet) => void
}

export default function useWalletTable({handleEdit}: useWalletTableProps) {
    const getWalletTypeInfo = (type: string) => {
        switch (type) {
            case "CASH": return { label: "Tiền mặt", icon: <WalletIcon size={18} />, color: "text-emerald-500 dark:text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30" };
            case "BANK": return { label: "Ngân hàng", icon: <Landmark size={18} />, color: "text-blue-500 dark:text-blue-500 bg-blue-100 dark:bg-blue-900/30" };
            case "E_WALLET": return { label: "Ví điện tử", icon: <Smartphone size={18} />, color: "text-purple-500 dark:text-purple-500 bg-purple-100 dark:bg-purple-900/30" };
            case "CREDIT_CARD": return { label: "Thẻ tín dụng", icon: <CreditCard size={18} />, color: "text-orange-500 dark:text-orange-500 bg-orange-100 dark:bg-orange-900/30" };
            case "LOAN": return { label: "Khoản nợ", icon: <Users size={18} />, color: "text-red-500 dark:text-red-500 bg-red-100 dark:bg-red-900/30" };
            default: return { label: type, icon: <WalletIcon size={18} />, color: "text-gray-500 dark:text-gray-500 bg-gray-100" };
        }
    };

    const { mutateAsync: deleteWallet } = useDeleteWallet();

    // function handleDelete(wallet: Wallet) {
    //     return <ConfirmModal
    //         title="Xóa ví vĩnh viễn?"
    //         description={`Bạn có chắc muốn xóa ví "${wallet.name}"? Chỉ có thể xóa ví nếu số dư = 0 và chưa có giao dịch nào.`}
    //         onConfirm={async () => {
    //             await deleteWallet(wallet.id)
    //         } } 
    //         isOpen={false} 
    //         onClose={function (): void {
    //             throw new Error("Function not implemented.");
    //         } }              
    //         />
    // }

    const filterConfigs: FilterConfig[] = [
        {
            key: "type",
            label: "Tất cả loại",
            type: "select",
            options: [
                { label: getWalletTypeInfo("CASH").label, value: "CASH" },
                { label: getWalletTypeInfo("BANK").label, value: "BANK" },
                { label: getWalletTypeInfo("E_WALLET").label, value: "E_WALLET" },
                { label: getWalletTypeInfo("CREDIT_CARD").label, value: "CREDIT_CARD" },
                { label: getWalletTypeInfo("LOAN").label, value: "LOAN" },
            ],
            className: "w-[135px]"
        },
        {
            key: "is_active",
            label: "Tất cả trạng thái",
            type: "select",
            options: [
                { label: "Đang hoạt động", value: "true" },
                { label: "Đã khoá", value: "false" },
            ],
            className: "w-[180px]"
        }
    ];

    const columns: ColumnDef<Wallet>[] = [
        {
            accessorKey: "name",
            header: "Tên tài khoản",
            cell: ({ row }) => {
                const typeInfo = getWalletTypeInfo(row.original.type);
                return (
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeInfo.color}`}>
                            {typeInfo.icon}
                        </div>
                        <span className="text-[15px] font-bold text-[#1B212D] dark:text-white">
                            {row.original.name}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "type",
            header: "Phân loại",
            cell: ({ row }) => (
                <Badge variant="default" className={`${getWalletTypeInfo(row.original.type).color}`}>
                    {getWalletTypeInfo(row.original.type).label}
                </Badge>
            ),
        },
        {
            accessorKey: "balance",
            header: "Số dư hiện tại",
            cell: ({ row }) => {
                const balance = row.original.balance;
                const isDebt = row.original.type === "CREDIT_CARD" || row.original.type === "LOAN";

                // Format tiền VNĐ
                const formatted = new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(balance);

                // Nếu là Ví nợ hoặc tiền âm thì chữ màu đỏ, ngược lại màu đen/trắng bình thường
                return (
                    <span className={`text-[15px] font-bold ${balance < 0 || isDebt ? "text-red-500" : "text-[#1B212D] dark:text-white"}`}>
                        {formatted}
                    </span>
                );
            },
        },
        {
            accessorKey: "is_active",
            header: "Trạng thái",
            cell: ({ row }) => {
                const isActive = row.original.is_active ?? true; // Backend chưa trả về thì mặc định True
                return isActive ? (
                    <Badge variant="ghost" showDot dotColor="bg-[#C8EE44]">
                        Đang hoạt động
                    </Badge>
                ) : (
                    <Badge variant="ghost" showDot dotColor="bg-red-500">
                        Đã khóa
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: () => <div className="text-right">Hành động</div>,
            cell: ({ row }) => {
                const wallet = row.original;

                return (
                    <div className="text-right mr-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 text-[#78778B] hover:text-[#1B212D] dark:hover:text-white transition-colors">
                                    <span className="sr-only">Mở menu</span>
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#1C1A2E] border-[#F2F2F2] dark:border-[#2A3143] rounded-2xl shadow-lg p-1">
                                <DropdownMenuLabel className="text-[12px] font-bold text-[#929EAE] uppercase px-2 py-1.5">
                                    Thao tác ví
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-[#F2F2F2] dark:bg-[#2A3143]" />

                                <DropdownMenuItem
                                    onClick={() => handleEdit(wallet)}
                                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg hover:bg-[#F8F9FB] dark:hover:bg-[#2A3143] focus:bg-[#F8F9FB] dark:focus:bg-[#2A3143] text-[#1B212D] dark:text-white font-medium transition-colors"
                                >
                                    <Edit className="h-4 w-4 text-[#78778B]" />
                                    Sửa thông tin ví
                                </DropdownMenuItem>

                                <ConfirmModal
                                    title="Xóa ví vĩnh viễn?"
                                    description={`Bạn có chắc muốn xóa ví "${wallet.name}"? Dữ liệu không thể khôi phục.`}
                                    onConfirm={async () => {
                                    try {
                                        await deleteWallet(wallet.id); 
                                        toast.success("Cập nhật ví thành công!");
                                    } catch (error: any) {
                                        const errorMessage = error.response?.data?.detail || "Đã có lỗi không xác định xảy ra.";

                                        toast.error("Xóa ví thất bại", {description: errorMessage});
                                    }
                                    
                                    }}
                                    trigger={
                                    <DropdownMenuItem 
                                        onSelect={(e) => e.preventDefault()} 
                                        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" /> Xóa ví
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

    return { filterConfigs, columns }
}

