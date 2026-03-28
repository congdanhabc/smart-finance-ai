import { Outlet } from 'react-router-dom'
// Import Header, Sidebar nếu có

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* <Header /> */}
      
      {/* Khung chứa nội dung chính (Pages) */}
      <main className="p-4 md:p-8 max-w-6xl mx-auto">
        <Outlet /> 
      </main>
    </div>
  )
}