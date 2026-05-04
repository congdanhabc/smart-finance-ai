import z from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên danh mục"),
  type: z.string().min(1, "Vui lòng chọn phân loại"),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export default categorySchema;