import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import LoginPage from '@/pages/auth/login';
import { PrivateRoute, PublicRoute } from './ProtectedRoute';
import AuthLayout from '@/layouts/AuthLayout';
import RegisterPage from '@/pages/auth/register';
import NotFound from '@/pages/NotFound';
import VerifyPage from '@/pages/auth/verify';
import WalletPage from '@/pages/wallet/wallet';
import CategoryPage from '@/pages/category/category';
import TransactionPage from '@/pages/transaction/transaction';
import AiChatPage from '@/pages/ai/aiChat';
import SettingsPage from '@/pages/setting/settings';
import ForgotPasswordPage from '@/pages/auth/forgotPassword';
import ResetPasswordPage from '@/pages/auth/resetPassword';
import DashboardPage from '@/pages/Dashboard';

export const router = createBrowserRouter([
  {
    element: <PrivateRoute />, 
    children:[
      {
        path: '/',
        element: <MainLayout />, 
        children:[
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'wallet',
            element: <WalletPage />
          },
          {
            path: 'category',
            element: <CategoryPage />
          },
          {
            path: 'transaction',
            element: <TransactionPage />
          },
          {
            path: 'ai-chat',
            element: <AiChatPage />
          },
          {
            path: 'setting',
            element: <SettingsPage />
          }
        ],
      },
    ],
  },
  
  {
    element: <PublicRoute />, 
    children:[
      {
        index: true
      },
      {
        path: '/auth',
        element: <AuthLayout />, 
        children:[
          {
            index: true,
            element: <LoginPage />, 
          },
          {
            path: 'register',
            element: <RegisterPage />,
          },
          {
            path: 'verify',
            element: <VerifyPage />,
          },
          {
            path: 'forgot-password',
            element: <ForgotPasswordPage />,
          },
          {
            path: 'reset-password',
            element: <ResetPasswordPage />,
          }
        ],
      },
    ],
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);