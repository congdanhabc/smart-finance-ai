import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import useCategoryTable from "@/hooks/table/useCategoryTable";
import { useGetCategories } from "@/hooks/query/category";
import { useTableParams } from "@/hooks/useTableParams";
import { useState } from "react";
import type { Category } from "@/type/category.type";
import { FormSheet } from "@/components/form/form-sheet";
import CategoryForm from "./categoryForm";

export default function CategoryPage() {
    const[isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const actions = {
        handleCreate: () => {
            setSelectedCategory(null);
            setIsSheetOpen(true);
        },
        handleEdit: (category: Category) => {
            setSelectedCategory(category);
            setIsSheetOpen(true);
        }
    }

    // 1. Quản lý tham số gọi API
    const { tableState, updateTableState, setFilter, resetFilters, apiParams } = useTableParams();


    // 2. Hook
    const { data, isLoading } = useGetCategories(apiParams);

    // 3. Lấy dữ liệu phân trang từ Backend trả về
    const categories = data?.data || [];
    const totalItem = data?.total || 0;
    const totalPage = data?.total_pages || 1;


    const { filterConfigs, columns } = useCategoryTable(actions);

    return (
        <div className="w-full bg-white dark:bg-[#1C1A2E] rounded-4xl p-6 shadow-sm border border-[#F2F2F2] dark:border-[#2A3143]">
            {/* Header trang Ví */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-[#1B212D] dark:text-white">Danh mục giao dịch</h2>
                    <p className="text-sm text-[#78778B] mt-1">Phân loại các khoản thu chi để quản lý tài chính hiệu quả hơn</p>
                </div>

                {/* Nút thêm ví */}
                <Button 
                    onClick={actions.handleCreate}
                    className="bg-[#1B212D] dark:bg-white text-white dark:text-[#1B212D] hover:bg-[#2A3143] dark:hover:bg-slate-200 font-bold rounded-xl h-11 px-5">
                    <Plus className="w-5 h-5 mr-2" /> Thêm danh mục
                </Button>
            </div>


            {/* Gọi Component DataTable Dùng Chung */}
            <DataTable
                columns={columns}
                data={categories}
                isLoading={isLoading}
                pageIndex={tableState.page}
                pageSize={tableState.size}
                totalPage={totalPage}
                totalItem={totalItem}
                onPageChange={(page) => updateTableState({ page })}
                emptyMessage="Không tìm thấy danh mục nào."

                searchKey="name"
                searchPlaceholder="Tìm kiếm danh mục..."
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
                title={selectedCategory ? "Cập nhật danh mục" : "Tạo danh mục mới"}
                description={
                    selectedCategory 
                    ? "Thay đổi thông tin hiển thị của danh mục này." 
                    : "Thêm danh mục mới để bắt đầu phân loại các giao dịch của bạn."
                }
            >
                <CategoryForm
                    initialData={selectedCategory}
                    onOpenChange={(isOpen) => setIsSheetOpen(isOpen)}
                />
            </FormSheet>
        </div>
    );
}