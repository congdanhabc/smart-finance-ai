import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus, ScanLine } from "lucide-react";
import useTransactionTable from "@/hooks/table/useTransactionTable";
import { useGetTransactions } from "@/hooks/query/transaction";
import { useTableParams } from "@/hooks/useTableParams";
import { useState } from "react";
import type { Transaction } from "@/type/transaction.type";
import { FormSheet } from "@/components/form/form-sheet";
import TransactionForm from "./transactionForm";
import { ScanReceiptDialog } from "@/components/ui/scan-receipt-dialog";

export default function TransactionPage() {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isScanOpen, setIsScanOpen] = useState(false);

    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const actions = {
        handleCreate: () => {
            setSelectedTransaction(null);
            setIsSheetOpen(true);
        },
        handleEdit: (transaction: Transaction) => {
            setSelectedTransaction(transaction);
            setIsSheetOpen(true);
        }
    }

    // 1. Quản lý tham số gọi API (Phân trang, Lọc, Search)
    const { tableState, updateTableState, setFilter, resetFilters, apiParams } = useTableParams();

    // 2. Hook lấy danh sách giao dịch
    const { data, isLoading } = useGetTransactions(apiParams);

    // 3. Lấy dữ liệu phân trang từ Backend trả về
    const transactions = data?.data || [];
    const totalItem = data?.total || 0;
    const totalPage = data?.total_pages || 1;

    // 4. Lấy cấu hình bảng chuyên dụng cho Giao dịch
    const { filterConfigs, columns } = useTransactionTable(actions);

    // Hàm xử lý khi AI trả về kết quả thành công
    const handleScanSuccess = (draftData: any) => {
        setIsScanOpen(false);
        setSelectedTransaction(draftData);
        setIsSheetOpen(true);
    };

    return (
        <div className="w-full bg-white dark:bg-[#1C1A2E] rounded-[24px] p-6 shadow-sm border border-[#F2F2F2] dark:border-[#2A3143]">
            
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-[#1B212D] dark:text-white">Lịch sử giao dịch</h2>
                    <p className="text-sm text-[#78778B] mt-1">Quản lý và theo dõi các khoản thu chi, chuyển tiền của bạn</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => setIsScanOpen(true)}
                        className="bg-white dark:bg-[#2A3143] border border-[#F2F2F2] dark:border-[#1C1A2E] text-[#1B212D] dark:text-white hover:bg-[#F8F9FB] font-bold rounded-xl h-11 px-4 transition-colors shadow-sm"
                    >
                        <ScanLine className="w-5 h-5 sm:mr-2 text-blue-500" /> 
                        <span className="hidden sm:inline">Quét hóa đơn</span>
                    </Button>

                    <Button 
                        onClick={() => { setSelectedTransaction(null); setIsSheetOpen(true); }}
                        className="bg-[#C8EE44] hover:bg-[#b8de34] text-[#1B212D] font-bold rounded-xl h-11 px-5"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Thêm
                    </Button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={transactions}
                isLoading={isLoading}
                pageIndex={tableState.page}
                pageSize={tableState.size}
                totalPage={totalPage}
                totalItem={totalItem}
                onPageChange={(page) => updateTableState({ page })}
                emptyMessage="Bạn chưa có bản ghi giao dịch nào."

                searchKey="description"
                searchPlaceholder="Tìm kiếm giao dịch..."
                searchValue={tableState.search}
                onSearchChange={(val) => updateTableState({ search: val })}

                filterConfigs={filterConfigs}
                filterValues={tableState.filters}
                onFilterChange={setFilter}
                onResetFilters={resetFilters}
            />

            <ScanReceiptDialog 
                isOpen={isScanOpen} 
                onClose={() => setIsScanOpen(false)} 
                onScanSuccess={handleScanSuccess} 
            />

            <FormSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                title={selectedTransaction ? "Cập nhật giao dịch" : "Ghi chép giao dịch mới"}
                description={
                    selectedTransaction 
                    ? "Chỉnh sửa lại thông tin bản ghi giao dịch này." 
                    : "Nhập thông tin giao dịch để hệ thống tự động tính toán dòng tiền."
                }
            >
                <TransactionForm
                    initialData={selectedTransaction}
                    onOpenChange={(isOpen) => setIsSheetOpen(isOpen)}
                />
            </FormSheet>
        </div>
    );
}