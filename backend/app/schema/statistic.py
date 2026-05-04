from pydantic import BaseModel, ConfigDict
from typing import List
from enum import Enum

# Các mốc thời gian hỗ trợ
class TimePeriod(str, Enum):
    WEEK = "WEEK"
    MONTH = "MONTH"
    YEAR = "YEAR"

# 1. Dành cho 3 thẻ Card Tổng quan
class SummaryStat(BaseModel):
    total_income: float
    total_expense: float
    balance: float

# 2. Dành cho Biểu đồ Tròn (Pie Chart - Cơ cấu chi tiêu)
class CategoryStat(BaseModel):
    category_name: str
    color: str | None
    amount: float

# 3. Dành cho Biểu đồ Đường/Cột (Line/Bar Chart - Xu hướng)
class TrendStat(BaseModel):
    time_label: str # Có thể là "Thứ 2", "01/04", "Tháng 1"...
    income: float
    expense: float

# 4. Cục tổng hợp trả về cho Frontend 1 lần duy nhất
class DashboardResponse(BaseModel):
    summary: SummaryStat
    category_breakdown: List[CategoryStat]
    trend_data: List[TrendStat]

    model_config = ConfigDict(from_attributes=True)