// src/store/auth.ts
import { create } from 'zustand';
import { type UserProps } from '@/type/user.type';

interface AuthState {
  token: string | undefined;
  user: UserProps | undefined;
  setAuth: (token: string, user: UserProps) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Khởi tạo lấy từ localStorage nếu người dùng f5 trang
  token: localStorage.getItem('token') || undefined,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: undefined, user: undefined });
  }
}));