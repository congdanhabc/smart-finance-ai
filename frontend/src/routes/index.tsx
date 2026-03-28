import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import Dashboard from '@/pages/Dashboard'
// import Transactions from '@/pages/Transactions'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children:[
      {
        index: true, // Trang mặc định khi vào '/'
        element: <Dashboard />,
      },
      // Thêm các route khác ở đây sau này
      // { path: 'transactions', element: <Transactions /> },
    ],
  },
])