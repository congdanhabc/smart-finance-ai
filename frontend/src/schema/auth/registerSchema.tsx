import * as z from "zod";

const registerSchema = z.object({
    full_name: z.string().trim().min(1, "Vui lòng nhập họ và tên"),
    email: z.email("Vui lòng nhập đúng định dạng email"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirm_password: z.string().min(1, "Vui lòng xác nhận lại mật khẩu")
}).refine((data) => data.password === data.confirm_password, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirm_password"],
});

export default registerSchema;