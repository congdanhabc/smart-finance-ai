import z from "zod";

const resetSchema = z.object({
  code: z.string().length(6, "Vui lòng nhập đủ mã 6 số"),
  new_password: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  confirm_password: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Mật khẩu xác nhận không khớp",
  path:["confirm_password"],
});

export default resetSchema