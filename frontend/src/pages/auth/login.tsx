import useAuth from '@/hook/query/auth';
import loginSchema from '@/schema/auth/loginSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  // 1. Luôn khai báo defaultValues
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: 'onSubmit',
  });

  const { control, getValues, reset } = form;

  const { handleLogin } = useAuth();


  const onSubmit = async () => {
    const dataForm = getValues();

    const dataPayload = {
      email: dataForm.email,
      password: dataForm.password,
    };
    try {
      await handleLogin.mutateAsync(dataPayload);
      reset()
    } catch (err) {

      console.error("Login error:", err);
    }
  }


  return (
    <div className="w-full max-w-101 flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[30px] font-semibold text-[#1B212D] leading-tight text-nowrap">
          Chào mừng bạn quay trở lại!
        </h1>
        <p className="text-[16px] font-normal text-[#78778B]">
          Đăng nhập để tiếp tục quản lý tài chính của bạn
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">

          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-0">
                <FormLabel className="text-[14px] font-medium text-[#1B212D] pb-2.5">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Nhập email của bạn"
                    {...field}
                    className="w-full px-5 py-3.75 rounded-[10px] border border-[#F2F2F2] text-[14px] font-medium text-[#78778B] placeholder-[#78778B] outline-none focus:border-[#C8EE44] transition-colors bg-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-0">
                <FormLabel className="text-[14px] font-medium text-[#1B212D] pb-2.5">Mật khẩu</FormLabel>
                <FormControl>
                  <div className="relative w-full">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu của bạn"
                      {...field}
                      className="w-full px-5 pr-12 py-3.75 rounded-[10px] border border-[#F2F2F2] text-[14px] font-medium text-[#78778B] placeholder-[#78778B] outline-none focus:border-[#C8EE44] transition-colors bg-white"
                    />

                    <button
                      type="button" // Bắt buộc phải có type="button" để không làm submit form
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#78778B] hover:text-[#1B212D] transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sign in button */}
          <Button
            type="submit"
            className={`w-full py-3.5 px-5 rounded-[10px] text-[#1B212D] text-[16px] font-semibold text-center transition-colors ${handleLogin.isPending ? "bg-[#C8EE44]/80 cursor-not-allowed" : "bg-[#C8EE44] hover:bg-[#b8de34]"}`}
            disabled={handleLogin.isPending}
          >
            {handleLogin.isPending ?
              <div className="flex justify-between items-center">
                <Spinner data-icon="inline-start" />
                <span className="ml-2">Đang xử lý...</span>
              </div>
              : "Đăng nhập"}

          </Button>

        </form>
      </Form>

      <div className="flex flex-col items-center space-y-5">
        {/* Sign up link */}
        <Button
          type="button"
          className="w-full p-0 text-[16px] font-semibold text-[#78778B] rounded-[10px] border border-[#F5F5F5] flex items-center justify-center gap-2.5 hover:border-[#e0e0e0] hover:text-white transition-colors bg-white"
          disabled={handleLogin.isPending}
        >
          <Link
            to="/auth/register"
            className='w-full py-3.25 px-5'
          >
            Đăng ký ngay
          </Link>
        </Button>

        <div className="text-[14px] flex items-center justify-between w-full">
          <span className="text-[#929EAE] font-normal">
            Bạn quên mật khẩu ?{" "}
          </span>
          <Link
            to="/auth/forgot-password"
            className={`text-[14px] font-medium text-[#1B212D] hover:text-[#C8EE44] transition-colors ${handleLogin.isPending ? "opacity-50 pointer-events-none" : ""}`}
          >
            Đặt lại mật khẩu
          </Link>
        </div>
      </div>
    </div>
  );
}