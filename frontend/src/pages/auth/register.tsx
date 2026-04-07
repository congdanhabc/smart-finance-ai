import useAuth from '@/hook/query/auth';
import registerSchema from '@/schema/auth/registerSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
    const navigate = useNavigate();
    
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            full_name: "",
            email: "",
            password: "",
            confirm_password: "",
        },
        mode: 'onSubmit',
    });

    const { control, getValues, reset } = form;

    const { handleRegister } = useAuth();


    const onSubmit = async () => {
        const dataForm = getValues();

        const dataPayload = {
            full_name: dataForm.full_name,
            email: dataForm.email,
            password: dataForm.password,
        };
        try {
            await handleRegister.mutateAsync(dataPayload);

            navigate('/auth/verify', { 
                state: { 
                fromRegister: true,
                email: dataForm.email 
                },
                replace: true
            });
            reset();
        } catch (err) {

            console.error("Register error:", err);
        }
    }


    return (
        <div className="w-full max-w-101 flex flex-col gap-6">
            {/* Title */}
            <div className="flex flex-col gap-2">
                <h1 className="text-[30px] font-semibold text-[#1B212D] leading-tight">
                    Đăng ký tài khoản
                </h1>
                <p className="text-[16px] font-normal text-[#78778B]">
                    Đăng ký để bắt đầu quản lý tài chính của bạn
                </p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2">

                    <FormField
                        control={control}
                        name="full_name"
                        render={({ field }) => (
                            <FormItem className="flex flex-col gap-0">
                                <FormLabel className="text-[14px] font-medium text-[#1B212D] pb-2.5">Họ tên người dùng</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        placeholder="Nhập họ và tên của bạn"
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
                                            className="w-full px-5 py-3.75 rounded-[10px] border border-[#F2F2F2] text-[14px] font-medium text-[#78778B] placeholder-[#78778B] outline-none focus:border-[#C8EE44] transition-colors bg-white"
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

                    <FormField
                        control={control}
                        name="confirm_password"
                        render={({ field }) => (
                            <FormItem className="flex flex-col gap-0">
                                <FormLabel className="text-[14px] font-medium text-[#1B212D] pb-2.5">Xác nhận mật khẩu</FormLabel>
                                <FormControl>
                                    <div className="relative w-full">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Nhập lại mật khẩu của bạn"
                                            {...field}
                                            className="w-full px-5 py-3.75 rounded-[10px] border border-[#F2F2F2] text-[14px] font-medium text-[#78778B] placeholder-[#78778B] outline-none focus:border-[#C8EE44] transition-colors bg-white"
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
                        className={`w-full py-3.5 px-5 rounded-[10px] text-[#1B212D] text-[16px] font-semibold text-center transition-colors ${handleRegister.isPending ? "bg-[#C8EE44]/80 cursor-not-allowed" : "bg-[#C8EE44] hover:bg-[#b8de34]"}`}
                        disabled={handleRegister.isPending}
                    >
                        {handleRegister.isPending ?
                            <div className="flex justify-between items-center">
                                <Spinner data-icon="inline-start" />
                                <span className="ml-2">Đang xử lý...</span>
                            </div>
                            : "Đăng ký"}

                    </Button>

                </form>
            </Form>

            <div className="flex flex-col items-center space-y-5">

                <div className="text-[14px] flex items-center justify-between w-full">
                    <span className="text-[#929EAE] font-normal">
                        Bạn đã có tài khoản ?{" "}
                    </span>
                    <Link
                        to="/auth"
                        className={`text-[14px] font-medium text-[#1B212D] hover:text-[#C8EE44] transition-colors ${handleRegister.isPending ? "opacity-50 pointer-events-none" : ""}`}
                    >
                        Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
}