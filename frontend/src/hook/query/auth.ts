// src/hook/query/auth.ts
import { useMutation } from '@tanstack/react-query';
import { api } from '@/api/client';
import { ENDPOINT } from '@/api/endpoint';
import type { LoginPayload, RegisterPayload, AuthResponse, VerifyPayload } from '@/type/auth.type';
import { useAuthStore } from '@/store/auth';
import { toast } from "sonner"

export default function useAuth()
{
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const handleLogin = useMutation({
    mutationFn: (payload: LoginPayload) => 
      api.post<AuthResponse>(ENDPOINT.AUTH.LOGIN, payload),
    
    onSuccess: (data) => {
      // Lưu token và user id vào Zustand store
      setAuth(data.access_token, data.user);

      toast.success("Đăng nhập thành công", {description: "Chào mừng bạn đã quay trở lại!"});
    },
    onError: (error: any) => {
      toast.error("Đăng nhập thất bại", {description: error.response.data.detail});
      console.error("Login error:", error);
    }
  });

  const handleRegister = useMutation({
    mutationFn: (payload: RegisterPayload) => api.post<{ detail: string }>(ENDPOINT.AUTH.REGISTER, payload),
    onSuccess: (data) => {
      toast.success("Đăng ký thành công", {description: data.detail});
    },
    onError: (error: any) => {
      toast.error("Đăng ký thất bại", {description: error.response.data.detail});
      console.error("Register error:", error);
    }
  });

  const handleResendOtp = useMutation({
    mutationFn: (payload: {email: string}) => api.post<{ detail: string }>(ENDPOINT.AUTH.RESEND_OTP, payload),
    onSuccess: (data) => {
      toast.success("Thành công", {description: data.detail});
    },
    onError: (error: any) => {
      toast.error("Thất bại", {description: error.response.data.detail});
      console.error("Register error:", error);
    }
  });

  const handleVerify = useMutation({
    mutationFn: (payload: VerifyPayload) => api.post<{ detail: string }>(ENDPOINT.AUTH.VERIFY_REGISTRATION, payload),
    onSuccess: (data) => {
      toast.success("Xác thực tài khoản thành công", {description: data.detail});
    },
    onError: (error: any) => {
      toast.error("Xác thực tài khoản thất bại", {description: error.response.data.detail});
      console.error("Register error:", error);
    }
  });

  return { handleLogin, handleRegister, handleVerify, handleResendOtp };
}