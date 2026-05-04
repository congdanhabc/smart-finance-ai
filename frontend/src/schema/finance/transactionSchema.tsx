import z from "zod";

const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  amount: z.number().min(1, "Số tiền phải > 0"),
  description: z.string().optional(),
  transaction_date: z.string().min(1, "Chọn ngày giao dịch"),
  
  wallet_id: z.string().optional(),
  category_id: z.string().optional(),
  from_wallet_id: z.string().optional(),
  to_wallet_id: z.string().optional(),
});

export default transactionSchema;