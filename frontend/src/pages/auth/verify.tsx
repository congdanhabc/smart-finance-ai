// src/pages/auth/verify.tsx
import useAuth from '@/hooks/query/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useEffect, useState } from 'react';

export default function VerifyPage() {
    const location = useLocation();
    const navigate = useNavigate(); // 2. Khởi tạo hook điều hướng
    const state = location.state as { fromRegister?: boolean; email?: string } | null;
    
    if (!state || !state.fromRegister || !state.email) {
        return <Navigate to="/auth/register" replace />;
    }

    const form = useForm({
        resolver: zodResolver(z.object({
            code: z.string().length(6, "Vui lòng nhập đủ 6 số xác thực")
        })),
        defaultValues: {
            code: "",
        },
        mode: 'onSubmit',
    });

    const { handleVerify, handleResendOtp } = useAuth();

    const onSubmit = async (values: { code: string }) => {
        const dataPayload = {
            email: state.email!,
            code: values.code,
        };
        try {
            await handleVerify.mutateAsync(dataPayload);
            navigate("/auth", { replace: true });
        } catch (err) {
            console.error("Verify error:", err);
        }
    }

    // RESEND OTP
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer); // Cleanup để tránh rò rỉ bộ nhớ
        }
    }, [countdown]);

    const onResendClick = async () => {
        if (countdown > 0) return;

        try {
            await handleResendOtp.mutateAsync({ email: state.email! });
            setCountdown(60); 
        } catch (error) {
            console.error("Resend Otp error:", error);
        }
    };

    return (
        <div className="w-full max-w-md flex flex-col gap-6 mx-auto mt-10">
            {/* Title */}
            <div className="flex flex-col gap-2 text-center mb-4">
                <h1 className="text-[30px] font-semibold text-[#1B212D] leading-tight">
                    Xác thực Email
                </h1>
                <p className="text-[16px] font-normal text-[#78778B]">
                    Vui lòng nhập mã 6 số được gửi tới <br/>
                    <span className="font-semibold text-[#1B212D]">{state.email}</span>
                </p>
            </div>
            
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">

                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem className="flex flex-col gap-2 items-center">
                                <FormLabel className="text-[14px] font-medium text-[#1B212D]">
                                    Mã xác thực (OTP)
                                </FormLabel>
                                <FormControl>
                                    {/* 4. GIAO DIỆN 6 Ô OTP */}
                                    <InputOTP maxLength={6} {...field}>
                                        <InputOTPGroup className="flex gap-2 sm:gap-3">
                                            {/* Tạo 6 ô Slot */}
                                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                                <InputOTPSlot 
                                                    key={index} 
                                                    index={index} 
                                                    className="w-12 h-14 sm:w-14 sm:h-16 text-xl font-semibold bg-white border border-[#F2F2F2] rounded-[10px] outline-none focus-visible:ring-1 focus-visible:ring-[#C8EE44] focus-visible:border-[#C8EE44] transition-all"
                                                />
                                            ))}
                                        </InputOTPGroup>
                                    </InputOTP>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Nút gửi lại otp */}
                    <div className="text-center mt-2 text-[14px]">
                        <span className="text-[#78778B]">Chưa nhận được mã? </span>
                        <button 
                            type="button" 
                            onClick={onResendClick}
                            disabled={countdown > 0 || handleResendOtp.isPending || handleVerify.isPending}
                            className={`font-semibold transition-colors ${
                                countdown > 0 || handleResendOtp.isPending || handleVerify.isPending
                                    ? "text-[#929EAE] cursor-not-allowed" 
                                    : "text-[#1B212D] hover:text-[#C8EE44]"
                            }`}
                        >
                            {handleResendOtp.isPending 
                                ? "Đang gửi..." 
                                : countdown > 0 
                                    ? `Gửi lại sau ${countdown}s` 
                                    : "Gửi lại mã"}
                        </button>
                    </div>

                    {/* Nút Xác nhận */}
                    <Button
                        type="submit"
                        className={`w-full mt-4 py-3.5 px-5 rounded-[10px] text-[#1B212D] text-[16px] font-semibold text-center transition-colors ${handleVerify.isPending ? "bg-[#C8EE44]/80 cursor-not-allowed" : "bg-[#C8EE44] hover:bg-[#b8de34]"}`}
                        disabled={handleVerify.isPending}
                    >
                        {handleVerify.isPending ?
                            <div className="flex justify-center items-center">
                                <Spinner data-icon="inline-start" />
                                <span className="ml-2">Đang xác thực...</span>
                            </div>
                            : "Xác nhận"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}