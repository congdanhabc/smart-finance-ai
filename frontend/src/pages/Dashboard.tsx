// src/pages/Dashboard.tsx
import { useAppStore } from "@/store/useAppStore";
import {
  PlusCircle,
  Wallet,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Send,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAppStore(); // Lấy state từ Zustand
  const [aiInput, setAiInput] = useState("");

  return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Section */}
          <header className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold">SmartFinance AI</h1>
                <p className="text-slate-500">Chào buổi sáng, {user?.name}!</p>
            </div>
            <Button className="rounded-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Thêm giao dịch
            </Button>
          </header>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  Tổng số dư
                </CardTitle>
                <Wallet className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">25.400.000 đ</div>
                <p className="text-xs text-green-500 mt-1">
                  +2.5% so với tháng trước
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  Thu nhập tháng này
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  12.000.000 đ
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  Đã chi tiêu
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  4.600.000 đ
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Smart Entry - Điểm nhấn của đồ án */}
          <Card className="border-2 border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4 text-blue-700 dark:text-blue-400">
                <MessageSquare className="h-5 w-5" />
                <span className="font-semibold uppercase text-sm tracking-wider">
                  Trợ lý ảo AI
                </span>
              </div>
              <div className="relative">
                <Input
                  placeholder="Ví dụ: 'Sáng nay ăn phở 45k' hoặc 'Tháng này tôi tiêu bao nhiêu tiền xăng?'"
                  className="pr-12 py-6 text-lg bg-white dark:bg-slate-900 border-none shadow-inner"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                />
                <Button
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 rounded-full"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center italic">
                AI sẽ tự động phân loại và nhập dữ liệu cho bạn.
              </p>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <History className="h-5 w-5" />
              <h2 className="text-lg font-bold">Giao dịch gần đây</h2>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
              {/* Transaction Item 1 */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                    🍜
                  </div>
                  <div>
                    <p className="font-semibold">Ăn sáng</p>
                    <p className="text-xs text-slate-500">
                      Hôm nay, 08:30 • Ăn uống
                    </p>
                  </div>
                </div>
                <span className="font-bold text-red-600">- 45.000đ</span>
              </div>

              {/* Transaction Item 2 */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                    💻
                  </div>
                  <div>
                    <p className="font-semibold">Lương Freelance</p>
                    <p className="text-xs text-slate-500">
                      Hôm qua, 15:00 • Thu nhập
                    </p>
                  </div>
                </div>
                <span className="font-bold text-green-600">+ 2.000.000đ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
