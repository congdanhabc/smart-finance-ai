import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { AppInput } from "@/components/form/app-input";
import { AppSelect } from "@/components/form/app-select";
import { Button } from "@/components/ui/button";
import { useCreateWallet, useUpdateWallet } from "@/hooks/query/wallet";
import { toast } from "sonner";
import { type Wallet } from "@/type/wallet.type";
import { Spinner } from "@/components/ui/spinner";
import walletSchema from "@/schema/finance/walletSchema";
import { Unlock, Lock } from "lucide-react";


interface WalletFormProps {
  initialData: Wallet | null; 
  onOpenChange: (isOpen: boolean) => void;
}

export default function WalletForm({ initialData, onOpenChange }: WalletFormProps) {
  const isUpdate = !!initialData;

  const { mutateAsync: createWallet, isPending: isCreating } = useCreateWallet();
  const { mutateAsync: updateWallet, isPending: isUpdating } = useUpdateWallet();
  const isPending = isCreating || isUpdating;

  const form = useForm<z.infer<typeof walletSchema>>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "",
      initial_balance: 0,
      is_active: initialData?.is_active ?? true,
    },
  });

  const isActive = form.watch("is_active");

  const onSubmit = async (values: z.infer<typeof walletSchema>) => {
    try {console.log("Form values:", values);
      if (isUpdate && initialData) {
        await updateWallet({ 
          id: initialData.id, 
          payload: { 
            name: values.name,
            is_active: values.is_active ?? true,
          } 
        });
        toast.success("Cập nhật ví thành công!");
      } else {
        await createWallet({
          name: values.name,
          type: values.type as any,
          initial_balance: values.initial_balance,
        });
        toast.success("Tạo ví mới thành công!");
      }
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Đã có lỗi không xác định xảy ra.";

      toast.error(isUpdate ? "Cập nhật thất bại" : "Tạo ví thất bại", {description: errorMessage});
    }
  };

  return (
    <Form {...form}>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full min-h-full">
        
        <div className="flex flex-col gap-6 pb-6">

          {isUpdate && (
            <div className="flex items-center justify-between p-4 bg-[#F8F9FB] dark:bg-[#2A3143] rounded-[10px] border border-[#F2F2F2] dark:border-[#2A3143]">
              <div className="flex flex-col gap-1">
                <span className="text-[14px] font-semibold text-[#1B212D] dark:text-white">
                  Trạng thái tài khoản
                </span>
                <span className="text-[13px] text-[#78778B]">
                  {isActive 
                    ? "Tài khoản đang hoạt động bình thường." 
                    : "Đã bị đóng băng. Không thể tạo giao dịch mới."}
                </span>
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => form.setValue("is_active", !isActive, { shouldDirty: true })}
                className={`h-9 px-4 font-semibold border-none transition-colors ${
                  isActive 
                    ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50" 
                    : "bg-[#C8EE44] text-[#1B212D] hover:bg-[#b8de34]"
                }`}
              >
                {isActive ? <> <Lock className="w-4 h-4 mr-2" /> Đóng băng ví </> : 
                           <> <Unlock className="w-4 h-4 mr-2" /> Mở khóa lại </>
                }
              </Button>
            </div>
          )}

          <AppInput control={form.control} name="name" label="Tên ví / tài khoản" placeholder="VD: Ví Tiền Mặt, Thẻ ACB..." />
          
          <AppSelect control={form.control} name="type" label="Phân loại" placeholder="Chọn loại ví" disabled={isUpdate} 
            options={[
              { label: "Tiền mặt", value: "CASH" },
              { label: "Ngân hàng / Thẻ ATM", value: "BANK" },
              { label: "Ví điện tử (Momo, ZaloPay...)", value: "E_WALLET" },
              { label: "Thẻ Tín Dụng (Credit Card)", value: "CREDIT_CARD" },
              { label: "Khoản nợ / Cho vay", value: "LOAN" },
            ]}
          />

          {!isUpdate && (
            <AppInput control={form.control} name="initial_balance" label="Số dư ban đầu (VNĐ)" type="number" placeholder="0" />
          )}

          {isUpdate && (
            <p className="text-[13px] text-[#78778B] bg-[#F8F9FB] dark:bg-[#2A3143] p-3.5 rounded-xl border border-[#F2F2F2] dark:border-[#2A3143]">
              💡 <strong>Lưu ý:</strong> Bạn không thể thay đổi Phân loại hoặc Số dư của ví đã tạo. 
            </p>
          )}
        </div>

        <div className="mt-auto pt-6 flex items-center justify-end gap-3 border-t border-[#F2F2F2] dark:border-[#2A3143] bg-white dark:bg-[#1C1A2E] sticky bottom-0 z-10">
          
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 rounded-[10px] px-6 border-[#F2F2F2] dark:border-[#2A3143] text-[#78778B] font-semibold hover:text-[#1B212D] dark:hover:text-white bg-transparent"
          >
            Đóng
          </Button>

          <Button
            type="submit"
            disabled={isPending}
            className="h-11 rounded-[10px] px-6 bg-[#C8EE44] hover:bg-[#b8de34] text-[#1B212D] text-[15px] font-bold transition-colors"
          >
            {isPending ? (
                <div className="flex items-center gap-2">
                <Spinner /> Đang xử lý...
                </div>
            ) : isUpdate ? "Lưu thay đổi" : "Tạo ví mới"}
          </Button>

        </div>

      </form>
    </Form>
  );
}