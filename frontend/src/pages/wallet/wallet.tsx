import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import useWalletTable from "@/hooks/table/useWalletTable";
import { useGetWallets } from "@/hooks/query/wallet";
import { useTableParams } from "@/hooks/useTableParams";
import { useState } from "react";
import type { Wallet } from "@/type/wallet.type";
import { FormSheet } from "@/components/form/form-sheet";
import WalletForm from "./walletForm";

export default function WalletPage() {
    const[isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

    const actions = {
        handleCreate: () => {
            setSelectedWallet(null);
            setIsSheetOpen(true);
        },
        handleEdit: (wallet: Wallet) => {
            setSelectedWallet(wallet);
            setIsSheetOpen(true);
        }
    }

    // 1. Quản lý tham số gọi API
    const { tableState, updateTableState, setFilter, resetFilters, apiParams } = useTableParams();


    // 2. Hook
    const { data, isLoading } = useGetWallets(apiParams);

    // 3. Lấy dữ liệu phân trang từ Backend trả về
    const wallets = data?.data || [];
    const totalItem = data?.total || 0;
    const totalPage = data?.total_pages || 1;


    const { filterConfigs, columns } = useWalletTable(actions);

    return (
        <div className="w-full bg-white dark:bg-[#1C1A2E] rounded-4xl p-6 shadow-sm border border-[#F2F2F2] dark:border-[#2A3143]">
            {/* Header trang Ví */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-[#1B212D] dark:text-white">Tài sản & Nợ</h2>
                    <p className="text-sm text-[#78778B] mt-1">Quản lý các ví tiền, tài khoản ngân hàng và thẻ tín dụng của bạn</p>
                </div>

                {/* Nút thêm ví */}
                <Button 
                    onClick={actions.handleCreate}
                    className="bg-[#1B212D] dark:bg-white text-white dark:text-[#1B212D] hover:bg-[#2A3143] dark:hover:bg-slate-200 font-bold rounded-xl h-11 px-5">
                    <Plus className="w-5 h-5 mr-2" /> Thêm tài khoản
                </Button>
            </div>


            {/* Gọi Component DataTable Dùng Chung */}
            <DataTable
                columns={columns}
                data={wallets}
                isLoading={isLoading}
                pageIndex={tableState.page}
                pageSize={tableState.size}
                totalPage={totalPage}
                totalItem={totalItem}
                onPageChange={(page) => updateTableState({ page })}
                emptyMessage="Bạn chưa tạo ví hoặc tài khoản nào."

                searchKey="description" // Bật thanh search
                searchPlaceholder="Tìm kiếm giao dịch..."
                searchValue={tableState.search}
                onSearchChange={(val) => updateTableState({ search: val })}

                filterConfigs={filterConfigs}
                filterValues={tableState.filters}
                onFilterChange={setFilter}
                onResetFilters={resetFilters}
            />

            <FormSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                title={selectedWallet ? "Cập nhật tài khoản" : "Thêm tài khoản mới"}
                description={selectedWallet ? "Chỉnh sửa tên tài khoản của bạn." : "Quản lý nguồn tiền bằng cách thêm tài khoản ngân hàng hoặc ví điện tử."}
            >
                <WalletForm
                    initialData={selectedWallet}
                    onOpenChange={(isOpen) => setIsSheetOpen(isOpen)}
                />
            </FormSheet>
        </div>
    );
}