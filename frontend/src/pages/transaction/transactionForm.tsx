import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { AppInput } from "@/components/form/app-input";
import { AppSelect } from "@/components/form/app-select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import type { TransactionType } from "@/type/transaction.type";
import { useCreateExpense, useCreateIncome, useCreateTransfer, useUpdateTransaction } from "@/hooks/query/transaction";
import { useGetWallets } from "@/hooks/query/wallet";
import { useGetCategories } from "@/hooks/query/category";
import transactionSchema from "@/schema/finance/transactionSchema";
import { AppDatePicker } from "@/components/form/app-date-picker";


interface TransactionFormProps {
  initialData: any | null;
  onOpenChange: (isOpen: boolean) => void;
}

export default function TransactionForm({ initialData, onOpenChange }: TransactionFormProps) {
  const isUpdate = !!initialData;
  const [currentType, setCurrentType] = useState<TransactionType>(initialData?.type || "EXPENSE");

  const { data: walletsData } = useGetWallets({ page: 1, size: 100 });
  const { data: categoriesData } = useGetCategories({ page: 1, size: 100 });

  const walletOptions = (walletsData?.data ||[]).map(w => ({ label: w.name, value: w.id }));
  const categoryOptions = (categoriesData?.data ||[])
    .filter(c => c.type === currentType)
    .map(c => ({ label: `${c.icon || "📌"} ${c.name}`, value: c.id }));

  const createExpense = useCreateExpense();
  const createIncome = useCreateIncome();
  const createTransfer = useCreateTransfer();
  const updateTransaction = useUpdateTransaction();

  const isPending = createExpense.isPending || createIncome.isPending || createTransfer.isPending || updateTransaction.isPending;

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: initialData?.type || "EXPENSE",
      amount: initialData?.amount || 0,
      description: initialData?.description || "",
      transaction_date: initialData ? initialData.transaction_date.split('T')[0] : new Date().toISOString().split('T')[0],
      wallet_id: initialData?.wallet_id || "",
      category_id: initialData?.category_id || "",
      from_wallet_id: initialData?.wallet_id || "",
      to_wallet_id: initialData?.to_wallet_id || "",
    },
  });

  const handleTabChange = (val: string) => {
    setCurrentType(val as TransactionType);
    form.setValue("type", val as TransactionType);
    form.setValue("category_id", ""); 
  };

  const onSubmit = async (values: z.infer<typeof transactionSchema>) => {
    try {
      if (values.type !== "TRANSFER") {
        if (!values.wallet_id) return form.setError("wallet_id", { message: "Vui lòng chọn ví" });
        if (!values.category_id) return form.setError("category_id", { message: "Vui lòng chọn danh mục" });
      } else {
        if (!values.from_wallet_id) return form.setError("from_wallet_id", { message: "Chọn ví nguồn" });
        if (!values.to_wallet_id) return form.setError("to_wallet_id", { message: "Chọn ví đích" });
        if (values.from_wallet_id === values.to_wallet_id) return toast.error("Ví nguồn và ví đích phải khác nhau");
      }

      const basePayload = {
        amount: values.amount,
        description: values.description,
        transaction_date: new Date(values.transaction_date).toISOString(),
      };

      if (isUpdate && initialData) {
        await updateTransaction.mutateAsync({
          id: initialData.id,
          payload: { ...values, transaction_date: basePayload.transaction_date }
        });
        toast.success("Cập nhật giao dịch thành công!");
      } else {
        if (values.type === "EXPENSE") {
          await createExpense.mutateAsync({ ...basePayload, wallet_id: values.wallet_id!, category_id: values.category_id! });
        } else if (values.type === "INCOME") {
          await createIncome.mutateAsync({ ...basePayload, wallet_id: values.wallet_id!, category_id: values.category_id! });
        } else if (values.type === "TRANSFER") {
          await createTransfer.mutateAsync({ ...basePayload, from_wallet_id: values.from_wallet_id!, to_wallet_id: values.to_wallet_id! });
        }
        toast.success("Ghi chép giao dịch thành công!");
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Đã có lỗi xảy ra");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full min-h-full pt-2">
        <div className="flex flex-col gap-5 pb-6">

          <Tabs value={currentType} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#F8F9FB] dark:bg-[#2A3143] rounded-[10px] p-1">
              <TabsTrigger disabled={isUpdate} value="EXPENSE" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[#1C1A2E] data-[state=active]:text-red-500 font-bold">Chi Tiêu</TabsTrigger>
              <TabsTrigger disabled={isUpdate} value="INCOME" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[#1C1A2E] data-[state=active]:text-emerald-500 font-bold">Thu Nhập</TabsTrigger>
              <TabsTrigger disabled={isUpdate} value="TRANSFER" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[#1C1A2E] data-[state=active]:text-blue-500 font-bold">Chuyển Tiền</TabsTrigger>
            </TabsList>
          </Tabs>

          <AppInput control={form.control} name="amount" label="Số tiền (VNĐ)" type="number" placeholder="VD: 50000" />

          {currentType !== "TRANSFER" ? (
            <div className="grid grid-cols-2 gap-4">
              <AppSelect control={form.control} name="wallet_id" label="Ví / Nguồn tiền" options={walletOptions} placeholder="Chọn ví..." />
              <AppSelect control={form.control} name="category_id" label="Danh mục" options={categoryOptions} placeholder="Chọn danh mục..." />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <AppSelect control={form.control} name="from_wallet_id" label="Từ ví (Rút ra)" options={walletOptions} placeholder="Ví nguồn..." />
              <AppSelect control={form.control} name="to_wallet_id" label="Đến ví (Nạp vào)" options={walletOptions} placeholder="Ví đích..." />
            </div>
          )}

          <AppInput control={form.control} name="description" label="Ghi chú giao dịch" placeholder="VD: Mua ly cafe sáng..." />
          <AppDatePicker control={form.control} name="transaction_date" label="Ngày giao dịch"/>
        </div>

        <div className="mt-auto pt-6 flex items-center justify-end gap-3 border-t border-[#F2F2F2] dark:border-[#2A3143] sticky bottom-0 z-10 bg-white dark:bg-[#1C1A2E]">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11 rounded-[10px] px-6 text-[#78778B] font-semibold bg-transparent">
            Hủy
          </Button>
          <Button type="submit" disabled={isPending} className="h-11 rounded-[10px] px-6 bg-[#C8EE44] hover:bg-[#b8de34] text-[#1B212D] font-bold">
            {isPending ? <Spinner /> : isUpdate ? "Lưu thay đổi" : "Lưu giao dịch"}
          </Button>
        </div>
      </form>
    </Form>
  );
}