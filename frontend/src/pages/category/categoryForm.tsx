import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { AppInput } from "@/components/form/app-input";
import { AppSelect } from "@/components/form/app-select";
import { Button } from "@/components/ui/button";
import { useCreateCategory, useUpdateCategory } from "@/hooks/query/category";
import { toast } from "sonner";
import type { Category } from "@/type/category.type";
import { Spinner } from "@/components/ui/spinner";
import categorySchema from "@/schema/finance/categorySchema";
import { AppColorPicker, AppIconPicker } from "@/components/form/app-picker";


type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
    initialData: Category | null;
    onOpenChange: (isOpen: boolean) => void;
}

export default function CategoryForm({ initialData, onOpenChange }: CategoryFormProps) {
    const isUpdate = !!initialData;

    const { mutateAsync: createCategory, isPending: isCreating } = useCreateCategory();
    const { mutateAsync: updateCategory, isPending: isUpdating } = useUpdateCategory();
    const isPending = isCreating || isUpdating;

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: initialData?.name || "",
            type: initialData?.type || "",
            icon: initialData?.icon || "📝",
            color: initialData?.color || "#C8EE44",
        },
    });

    const onSubmit = async (values: CategoryFormValues) => {
        try {
            if (isUpdate && initialData) {
                await updateCategory({
                    id: initialData.id,
                    payload: {
                        name: values.name,
                        icon: values.icon,
                        color: values.color,
                    },
                });
                toast.success("Cập nhật danh mục thành công!");
            } else {
                await createCategory({
                    name: values.name,
                    type: values.type as any,
                    icon: values.icon,
                    color: values.color,
                });
                toast.success("Tạo danh mục mới thành công!");
            }
            onOpenChange(false);
        } catch (error: any) {
            const errMsg = error.response?.data?.detail || "Đã có lỗi xảy ra.";
            toast.error(isUpdate ? "Cập nhật thất bại" : "Tạo mới thất bại", {
                description: errMsg,
            });
            console.error(error);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full min-h-full pt-2">
                <div className="flex flex-col gap-5 pb-6">

                    <AppInput
                        control={form.control}
                        name="name"
                        label="Tên danh mục"
                        placeholder="VD: Ăn uống, Tiền điện, Mua sắm..."
                    />

                    <AppSelect
                        control={form.control}
                        name="type"
                        label="Phân loại thu / chi"
                        placeholder="Chọn loại danh mục"
                        disabled={isUpdate}
                        options={[
                            { label: "Khoản Chi (Expense)", value: "EXPENSE" },
                            { label: "Khoản Thu (Income)", value: "INCOME" },
                        ]}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <AppIconPicker
                            control={form.control}
                            name="icon"
                            label="Icon đại diện"
                        />

                        <AppColorPicker
                            control={form.control}
                            name="color"
                            label="Màu sắc biểu đồ"
                        />
                    </div>

                    {isUpdate && (
                        <p className="text-[13px] text-[#78778B] bg-[#F8F9FB] dark:bg-[#2A3143] p-3.5 rounded-xl border border-[#F2F2F2] dark:border-[#2A3143] mt-2">
                            💡 <strong>Lưu ý:</strong> Bạn không thể thay đổi Phân loại (Thu/Chi) của danh mục đã tạo để đảm bảo tính chính xác của dữ liệu lịch sử.
                        </p>
                    )}
                </div>


                <div className="mt-auto pt-6 flex items-center justify-end gap-3 border-t border-[#F2F2F2] dark:border-[#2A3143] sticky bottom-0 z-10 bg-white dark:bg-[#1C1A2E]">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11 rounded-[10px] px-6 text-[#78778B] font-semibold border-[#F2F2F2] dark:border-[#2A3143] bg-transparent hover:bg-[#F8F9FB] dark:hover:bg-[#2A3143]">
                        Đóng
                    </Button>
                    <Button type="submit" disabled={isPending} className="h-11 rounded-[10px] px-6 bg-[#C8EE44] hover:bg-[#b8de34] text-[#1B212D] text-[15px] font-bold transition-colors">
                        {isPending ? <Spinner /> : isUpdate ? "Lưu thay đổi" : "Tạo danh mục"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}