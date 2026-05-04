export type TimePeriod = "WEEK" | "MONTH" | "YEAR";

export interface SummaryStat {
  total_income: number;
  total_expense: number;
  balance: number;
}

export interface CategoryStat {
  category_name: string;
  color: string | null;
  amount: number;
}

export interface TrendStat {
  time_label: string;
  income: number;
  expense: number;
}


export interface DashboardResponse {
  summary: SummaryStat;
  category_breakdown: CategoryStat[];
  trend_data: TrendStat[];
}

export interface DashboardParams {
  period: TimePeriod;
  date_str?: string;
}