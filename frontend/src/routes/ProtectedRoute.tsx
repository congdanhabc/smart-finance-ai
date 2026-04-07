import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

export const PrivateRoute = () => {
  const token = useAuthStore((state) => state.token);

  // Lệnh replace giúp xóa lịch sử trang, người dùng không thể bấm nút Back trên trình duyệt để quay lại
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

export const PublicRoute = () => {
  const token = useAuthStore((state) => state.token);

  // Nếu ĐÃ có token -> vào trang chủ Dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  // Nếu CHƯA có token -> Cho phép vào trang Login
  return <Outlet />;
};