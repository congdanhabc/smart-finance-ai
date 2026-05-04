import { useState } from "react";
import {
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Legend
} from "recharts";
import { Wallet, TrendingUp, TrendingDown, CalendarDays } from "lucide-react";
import { useGetDashboardStats } from "@/hooks/query/statistic";
import type { TimePeriod } from "@/type/statistic.type";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
};

const CustomTrendTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#1C1A2E] p-4 rounded-2xl shadow-xl border border-[#F2F2F2] dark:border-[#2A3143]">
        <p className="text-[14px] font-bold text-[#1B212D] dark:text-white mb-2">
          {format(new Date(label), "dd MMMM, yyyy", { locale: vi })}
        </p>
        <div className="space-y-1">
          <p className="text-[13px] font-semibold text-emerald-500">
            Thu: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-[13px] font-semibold text-red-500">
            Chi: {formatCurrency(payload[1].value)}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [period, setPeriod] = useState<TimePeriod>("MONTH");


  const { data, isLoading, isFetching } = useGetDashboardStats({ period });

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#1C1A2E] p-6 rounded-[24px] shadow-sm border border-[#F2F2F2] dark:border-[#2A3143]">
          <div className="space-y-3">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-full sm:w-60 rounded-2xl" />
        </div>

        {/* 3 Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white dark:bg-[#1C1A2E] p-6 rounded-[24px] shadow-sm border border-[#F2F2F2] dark:border-[#2A3143]">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-5 w-28 rounded-md" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
              <Skeleton className="h-9 w-40 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Biểu đồ đường (Line Chart) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1C1A2E] p-6 rounded-[24px] shadow-sm border border-[#F2F2F2] dark:border-[#2A3143]">
            <Skeleton className="h-6 w-48 mb-6 rounded-md" />
            <Skeleton className="h-75 w-full rounded-3xl" />
          </div>

          {/* Biểu đồ tròn (Pie Chart) */}
          <div className="bg-white dark:bg-[#1C1A2E] p-6 rounded-[24px] shadow-sm border border-[#F2F2F2] dark:border-[#2A3143]">
            <Skeleton className="h-6 w-40 mb-6 rounded-md" />
            <div className="flex flex-col items-center justify-center h-75 gap-8">
              <Skeleton className="h-48 w-48 rounded-full" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-16 rounded-md" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const summary = data?.summary;
  const trendData = data?.trend_data || [];
  const categoryData = data?.category_breakdown || [];

  const processedCategoryData = categoryData.map(entry => ({
    ...entry,
    fill: entry.color || '#C8EE44',
  }));

  return (
    <div className="w-full space-y-6">

      {/* HEADER & LỌC THỜI GIAN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#1C1A2E] p-6 rounded-[24px] shadow-sm border border-[#F2F2F2] dark:border-[#2A3143]">
        <div>
          <h2 className="text-2xl font-bold text-[#1B212D] dark:text-white">Tổng quan tài chính</h2>
          <p className="text-sm text-[#78778B] mt-1">Theo dõi dòng tiền và báo cáo thu chi của bạn</p>
        </div>

        <div className="flex items-center bg-[#F8F9FB] dark:bg-[#2A3143] rounded-2xl p-1 border border-[#F2F2F2] dark:border-[#2A3143]">
          {(["WEEK", "MONTH", "YEAR"] as TimePeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-[14px] font-semibold transition-all ${period === p
                  ? "bg-white dark:bg-[#1C1A2E] text-[#1B212D] dark:text-white shadow-sm"
                  : "text-[#78778B] hover:text-[#1B212D] dark:hover:text-white"
                }`}
            >
              {p === "WEEK" ? "Tuần này" : p === "MONTH" ? "Tháng này" : "Năm nay"}
            </button>
          ))}
        </div>
      </div>

      {/* Hiệu ứng làm mờ nhẹ khi chuyển đổi Tuần/Tháng/Năm  */}
      <div className={`transition-opacity duration-300 ${isFetching && !isLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>

        {/* 1. THẺ SỐ DƯ TỔNG QUAN (STATS CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Card Tổng Tài Sản */}
          <div className="bg-[#1B212D] dark:bg-[#2A3143] p-6 rounded-[24px] shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8EE44] rounded-full blur-[60px] opacity-20 -mr-10 -mt-10" />
            <div className="flex justify-between items-center mb-4">
              <span className="text-[15px] font-medium text-[#929EAE]">Tổng tài sản ròng</span>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Wallet className="text-[#C8EE44] w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{formatCurrency(summary?.balance || 0)}</h3>
          </div>

          {/* Card Thu Nhập */}
          <div className="bg-white dark:bg-[#1C1A2E] p-6 rounded-[24px] shadow-sm border border-[#F2F2F2] dark:border-[#2A3143]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[15px] font-medium text-[#78778B]">Tổng thu nhập</span>
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="text-emerald-500 w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-[#1B212D] dark:text-white mb-1">{formatCurrency(summary?.total_income || 0)}</h3>
          </div>

          {/* Card Chi Tiêu */}
          <div className="bg-white dark:bg-[#1C1A2E] p-6 rounded-[24px] shadow-sm border border-[#F2F2F2] dark:border-[#2A3143]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[15px] font-medium text-[#78778B]">Tổng chi tiêu</span>
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="text-red-500 w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-[#1B212D] dark:text-white mb-1">{formatCurrency(summary?.total_expense || 0)}</h3>
          </div>
        </div>

        {/* 2. KHU VỰC BIỂU ĐỒ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Biểu đồ Dòng tiền  */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1C1A2E] p-6 rounded-[24px] shadow-sm border border-[#F2F2F2] dark:border-[#2A3143]">
            <div className="flex items-center gap-2 mb-6">
              <CalendarDays className="w-5 h-5 text-[#929EAE]" />
              <h3 className="text-[16px] font-bold text-[#1B212D] dark:text-white">Xu hướng Dòng tiền</h3>
            </div>

            {trendData.length > 0 ? (
              <div className="h-75 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                    <XAxis
                      dataKey="time_label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#929EAE', fontSize: 12 }}
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
                      }}
                      dy={10}
                    />
                    <YAxis
                      hide={true}
                    />
                    <Tooltip content={<CustomTrendTooltip />} cursor={{ stroke: '#929EAE', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-75 flex items-center justify-center text-[#78778B] bg-[#F8F9FB] dark:bg-[#2A3143] rounded-3xl">
                Chưa có giao dịch nào trong khoảng thời gian này
              </div>
            )}
          </div>

          {/* Biểu đồ Cơ cấu chi tiêu (Chiếm 1/3 màn hình) */}
          <div className="bg-white dark:bg-[#1C1A2E] p-6 rounded-[24px] shadow-sm border border-[#F2F2F2] dark:border-[#2A3143]">
            <h3 className="text-[16px] font-bold text-[#1B212D] dark:text-white mb-6">Cơ cấu Chi tiêu</h3>

            {categoryData.length > 0 ? (
              <div className="h-75 w-full flex flex-col items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={processedCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}  // Tạo khoảng trống ở giữa biến thành Donut Chart
                      outerRadius={100}
                      paddingAngle={5}  // Khoảng cách giữa các múi
                      dataKey="amount"
                      nameKey="category_name"
                      stroke="none"
                    />
                    <Tooltip
                      formatter={(value: any) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value) => <span className="text-[13px] font-medium text-[#78778B]">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-75 flex items-center justify-center text-[#78778B] bg-[#F8F9FB] dark:bg-[#2A3143] rounded-3xl text-center px-4">
                Hãy ghi chép chi tiêu để xem phân tích danh mục nhé!
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}