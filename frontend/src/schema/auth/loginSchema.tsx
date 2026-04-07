import * as z from "zod";

const loginSchema = z.object({
  email: z.email("Vui lòng nhập đúng định dạng email"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export default loginSchema;