// src/routes/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import Dashboard from '@/pages/Dashboard';
import LoginPage from '@/pages/auth/login';
import { PrivateRoute, PublicRoute } from './ProtectedRoute'; // Import guards
import AuthLayout from '@/layouts/AuthLayout';
import RegisterPage from '@/pages/auth/register';
import NotFound from '@/pages/NotFound';
import VerifyPage from '@/pages/auth/verify';

export const router = createBrowserRouter([
  {
    element: <PrivateRoute />, 
    children:[
      {
        path: '/dashboard',
        element: <MainLayout />, 
        children:[
          {
            index: true,
            element: <Dashboard />,
          },
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
        ],
      },
    ],
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);