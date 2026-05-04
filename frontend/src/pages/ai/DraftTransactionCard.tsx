import { useGetWallets } from "@/hooks/query/wallet";
import { useGetCategories } from "@/hooks/query/category";
import { useCreateExpense, useCreateIncome, useCreateTransfer } from "@/hooks/query/transaction";
import type { TransactionDraft } from "@/type/ai.type";
import { CheckCircle2, Save, FileText } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface DraftCardProps {
  draft: TransactionDraft;
  isSaved: boolean;
  onSave: () => void;
}

export default function DraftTransactionCard({ draft, isSaved, onSave }: DraftCardProps) {
  const { data: walletsData } = useGetWallets({ page: 1, size: 100 });
  const { data: catsData } = useGetCategories({ page: 1, size: 100 });

  const wallets = walletsData?.data ||[];
  const categories = catsData?.data ||[];

  // Hàm dịch ID
  const getWalletName = (id?: string | null) => wallets.find(w => w.id === id)?.name || "Không xác định";
  const getCatName = (id?: string | null) => categories.find(c => c.id === id)?.name || "Chưa phân loại";

  // Khởi tạo các hook lưu DB
  const { mutateAsync: createExpense, isPending: p1 } = useCreateExpense();
  const { mutateAsync: createIncome, isPending: p2 } = useCreateIncome();
  const { mutateAsync: createTransfer, isPending: p3 } = useCreateTransfer();
  const isPending = p1 || p2 || p3;

  const handleSaveToDB = async () => {
    try {
      if (draft.type === "EXPENSE") {
        await createExpense({ ...draft, wallet_id: draft.wallet_id!, category_id: draft.category_id! });
      } else if (draft.type === "INCOME") {
        await createIncome({ ...draft, wallet_id: draft.wallet_id!, category_id: draft.category_id! });
      } else if (draft.type === "TRANSFER") {
        if (!draft.from_wallet_id || !draft.to_wallet_id) {
          throw new Error("AI không xác định đủ Ví nguồn và Ví đích. Vui lòng nhập thủ công.");
        }
        if (draft.from_wallet_id === draft.to_wallet_id) {
          throw new Error("Ví nguồn và đích không được trùng nhau.");
        }
        
        await createTransfer({ 
          amount: draft.amount,
          description: draft.description,
          transaction_date: draft.transaction_date,
          from_wallet_id: draft.from_wallet_id, 
          to_wallet_id: draft.to_wallet_id 
        });
      }
      
      toast.success("Đã ghi sổ thành công!");
      onSave();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Lưu thất bại.");
    }
  };

  // Format tiền
  const fmtAmount = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(draft.amount);

  return (
    <div className="w-70 sm:w-[320px] bg-white dark:bg-[#1C1A2E] border border-[#F2F2F2] dark:border-[#2A3143] rounded-3xl shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="px-4 py-3 bg-[#F8F9FB] dark:bg-[#2A3143]/50 border-b border-[#F2F2F2] dark:border-[#2A3143] flex items-center gap-2">
        <FileText size={16} className="text-[#929EAE]" />
        <span className="text-[13px] font-bold text-[#1B212D] dark:text-white uppercase tracking-wider">
          {draft.type === "EXPENSE" ? "Khoản Chi" : draft.type === "INCOME" ? "Khoản Thu" : "Chuyển Khoản"}
        </span>
      </div>
      
      {/* Card Body */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <span className="text-[13px] text-[#78778B]">Số tiền</span>
          <span className={`text-[16px] font-bold ${draft.type === "EXPENSE" ? "text-red-500" : "text-emerald-500"}`}>
            {fmtAmount}
          </span>
        </div>
        
        <div className="flex justify-between items-start">
          <span className="text-[13px] text-[#78778B]">Từ ví</span>
          <span className="text-[14px] font-medium text-[#1B212D] dark:text-white text-right">
            {getWalletName(draft.wallet_id)}
          </span>
        </div>

        {draft.type !== "TRANSFER" && (
          <div className="flex justify-between items-start">
            <span className="text-[13px] text-[#78778B]">Danh mục</span>
            <span className="text-[14px] font-medium text-[#1B212D] dark:text-white text-right">
              {getCatName(draft.category_id)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-start">
          <span className="text-[13px] text-[#78778B]">Ghi chú</span>
          <span className="text-[14px] font-medium text-[#1B212D] dark:text-white text-right max-w-37.5 truncate">
            {draft.description}
          </span>
        </div>
      </div>

      {/* Card Footer (Action) */}
      <div className="p-3 bg-[#F8F9FB] dark:bg-[#2A3143]/20 border-t border-[#F2F2F2] dark:border-[#2A3143]">
        {isSaved ? (
          <div className="w-full h-10 rounded-[10px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center gap-2 text-[14px]">
            <CheckCircle2 size={18} /> Đã vào sổ
          </div>
        ) : (
          <button 
            onClick={handleSaveToDB}
            disabled={isPending}
            className="w-full h-10 rounded-[10px] bg-[#1B212D] hover:bg-[#2A3143] dark:bg-white dark:hover:bg-slate-200 text-white dark:text-[#1B212D] font-bold flex items-center justify-center gap-2 text-[14px] transition-colors"
          >
            {isPending ? <Spinner /> : <><Save size={16} /> Xác nhận lưu</>}
          </button>
        )}
      </div>
    </div>
  );
}