import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { AppInput } from "@/components/form/app-input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/query/auth";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ArrowLeft } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("Vui lòng nhập đúng định dạng email"),
});

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { useForgotPassword } = useAuth()
  const { mutateAsync: requestReset, isPending } = useForgotPassword();

  const form = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: z.infer<typeof forgotSchema>) => {
    try {
      const res = await requestReset({ email: values.email });
      toast.success("Đã gửi mã xác nhận", { description: res.detail });
      
      // Chuyển trang và truyền ngầm email theo
      navigate("/auth/reset-password", { 
        state: { email: values.email },
        replace: true 
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ detail: string }>;
      toast.error("Lỗi", { description: axiosError.response?.data?.detail || "Không thể gửi yêu cầu." });
    }
  };

  return (
      <div className="w-full max-w-100 flex flex-col gap-6 mx-auto">
        <div className="flex flex-col gap-2 text-center">
          <div className="w-12 h-12 bg-[#F8F9FB] rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-[30px] font-semibold text-[#1B212D] leading-tight">
            Quên mật khẩu?
          </h1>
          <p className="text-[15px] font-normal text-[#78778B] px-4">
            Đừng lo lắng! Hãy nhập email bạn đã đăng ký, chúng tôi sẽ gửi mã xác nhận để đặt lại mật khẩu.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 mt-2">
            <AppInput 
              control={form.control} 
              name="email" 
              label="Email xác thực" 
              placeholder="VD: example@gmail.com" 
            />

            <Button
              type="submit"
              disabled={isPending}
              className="w-full py-6 mt-2 rounded-2xl bg-[#C8EE44] hover:bg-[#b8de34] text-[#1B212D] text-[16px] font-bold transition-colors shadow-sm"
            >
              {isPending ? <Spinner /> : "Gửi mã xác nhận"}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-4">
          <Link
            to="/auth"
            className={`inline-flex items-center gap-2 text-[14px] font-semibold text-[#78778B] hover:text-[#1B212D] transition-colors ${isPending ? "pointer-events-none opacity-50" : ""}`}
          >
            <ArrowLeft size={16} /> Quay lại đăng nhập
          </Link>
        </div>
      </div>
  );
}