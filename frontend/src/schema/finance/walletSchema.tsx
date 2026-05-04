import z from "zod";

const walletSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên ví"),
  type: z.string().min(1, "Vui lòng chọn loại ví"),
  initial_balance: z.number().min(0, "Số dư không được âm"),
  is_active: z.boolean().optional(),
});
export default walletSchema;