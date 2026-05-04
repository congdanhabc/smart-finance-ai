import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { AppInput } from "@/components/form/app-input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/query/auth";
import { toast } from "sonner";
import { AxiosError } from "axios";
import resetSchema from "@/schema/auth/resetSchema";

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { email?: string } | null;

  // Không có state email thì về trang forgot
  if (!state || !state.email) {
    return <Navigate to="/auth/forgot-password" replace />;
  }

  const { useResetPassword } = useAuth()
  const { mutateAsync: resetPassword, isPending } = useResetPassword();

  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { code: "", new_password: "", confirm_password: "" },
  });

  const onSubmit = async (values: z.infer<typeof resetSchema>) => {
    try {
      await resetPassword({
        email: state.email as string,
        code: values.code,
        new_password: values.new_password,
      });
      
      toast.success("Tuyệt vời!", { description: "Mật khẩu của bạn đã được cập nhật." });
      navigate("/auth", { replace: true });
    } catch (error) {
      const axiosError = error as AxiosError<{ detail: string }>;
      toast.error("Thất bại", { description: axiosError.response?.data?.detail || "Mã OTP không đúng hoặc đã hết hạn." });
    }
  };

  return (
      <div className="w-full max-w-100 flex flex-col gap-6 mx-auto">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-[30px] font-semibold text-[#1B212D] leading-tight">
            Tạo mật khẩu mới
          </h1>
          <p className="text-[15px] font-normal text-[#78778B]">
            Mã xác thực đã được gửi đến <br/>
            <span className="font-semibold text-[#1B212D]">{state.email}</span>
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 mt-2">
            
            {/* NHẬP MÃ OTP */}
            <FormField
              control={form.control}
              name="code"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col items-center mb-2">
                  <FormLabel className="text-[14px] font-medium text-[#1B212D] pb-1">Mã xác thực (OTP)</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup className="flex gap-2">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <InputOTPSlot 
                            key={index} index={index} 
                            className={`w-12 h-14 text-xl font-bold bg-white rounded-[10px] border ${fieldState.error ? "border-red-500 ring-red-500" : "border-[#F2F2F2] focus-visible:ring-[#C8EE44] focus-visible:border-[#C8EE44]"}`}
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            
            <AppInput control={form.control} name="new_password" label="Mật khẩu mới" type="password" placeholder="Tối thiểu 6 ký tự" />
            <AppInput control={form.control} name="confirm_password" label="Xác nhận mật khẩu mới" type="password" placeholder="Nhập lại mật khẩu" />

            <Button
              type="submit"
              disabled={isPending}
              className="w-full py-6 mt-4 rounded-2xl bg-[#1B212D] hover:bg-[#2A3143] text-white text-[16px] font-bold transition-colors shadow-lg"
            >
              {isPending ? <Spinner /> : "Xác nhận đổi mật khẩu"}
            </Button>
          </form>
        </Form>
      </div>
  );
}