import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/routes'

// 1. Khởi tạo cấu hình mặc định cho TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Tắt tự động gọi lại API khi chuyển tab trình duyệt
      retry: 1, // Nếu lỗi API thì thử lại 1 lần
      staleTime: 1000 * 60 * 5, // Dữ liệu được coi là "tươi" trong 5 phút (đỡ tốn API)
    },
  },
})

function App() {
  return (
    // Bọc toàn bộ App bằng QueryClientProvider để mọi component đều gọi được API
    <QueryClientProvider client={queryClient}>
      
      {/* Cung cấp định tuyến (Router) */}
      <RouterProvider router={router} />

      {/* Devtools: Cực kỳ hữu ích để debug API trong quá trình làm đồ án */}
      {/* Nó sẽ hiện một icon bông hoa nhỏ góc phải màn hình, click vào để xem dữ liệu API */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      
    </QueryClientProvider>
  )
}

export default App