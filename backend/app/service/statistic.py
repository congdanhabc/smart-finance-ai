import calendar
from datetime import datetime, timedelta, time, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from app.model.transaction import Transaction, TransactionType
from app.model.category import Category
from app.schema.statistic import TimePeriod

class StatisticService:
    def __init__(self, db: Session):
        self.db = db

    def _get_date_range(self, period: TimePeriod, target_date: datetime):
        """Hàm nội bộ: Tính toán ngày bắt đầu và kết thúc dựa vào tham số"""
        # Đảm bảo target_date là timezone-aware (UTC)
        if target_date.tzinfo is None:
            target_date = target_date.replace(tzinfo=timezone.utc)

        if period == TimePeriod.WEEK:
            # Tuần bắt đầu từ Thứ 2 (0) đến Chủ Nhật (6)
            start = target_date - timedelta(days=target_date.weekday())
            end = start + timedelta(days=6)
        elif period == TimePeriod.MONTH:
            start = target_date.replace(day=1)
            last_day = calendar.monthrange(target_date.year, target_date.month)[1]
            end = target_date.replace(day=last_day)
        elif period == TimePeriod.YEAR:
            start = target_date.replace(month=1, day=1)
            end = target_date.replace(month=12, day=31)

        # Chốt thời gian: Từ 00:00:00 ngày bắt đầu -> 23:59:59 ngày kết thúc
        start_date = datetime.combine(start.date(), time.min, tzinfo=timezone.utc)
        end_date = datetime.combine(end.date(), time.max, tzinfo=timezone.utc)
        
        return start_date, end_date

    def get_dashboard_data(self, user_id: str, period: TimePeriod, target_date: datetime):
        start_date, end_date = self._get_date_range(period, target_date)

        # Câu Query gốc để tái sử dụng
        base_query = self.db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_date.between(start_date, end_date)
        )

        # ==========================================
        # 1. SUMMARY (TỔNG QUAN THU CHI)
        # ==========================================
        totals = self.db.query(
            Transaction.type, 
            func.sum(Transaction.amount).label('total')
        ).filter(
            Transaction.user_id == user_id,
            Transaction.transaction_date.between(start_date, end_date)
        ).group_by(Transaction.type).all()

        summary = {"total_income": 0.0, "total_expense": 0.0, "balance": 0.0}
        for tx_type, total in totals:
            if tx_type == TransactionType.INCOME: summary["total_income"] = float(total)
            if tx_type == TransactionType.EXPENSE: summary["total_expense"] = float(total)
        summary["balance"] = summary["total_income"] - summary["total_expense"]

        # ==========================================
        # 2. CATEGORY BREAKDOWN (BIỂU ĐỒ TRÒN CHI TIÊU)
        # ==========================================
        category_data = self.db.query(
            Category.name.label("category_name"), 
            Category.color, 
            func.sum(Transaction.amount).label('amount')
        ).join(Transaction, Category.id == Transaction.category_id)\
         .filter(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.EXPENSE,
            Transaction.transaction_date.between(start_date, end_date)
        ).group_by(Category.id).all()

        # ==========================================
        # 3. TREND DATA (BIỂU ĐỒ ĐƯỜNG XU HƯỚNG)
        # ==========================================
        # Nhóm theo ngày (Day) nếu là Tuần/Tháng. Nhóm theo tháng (Month) nếu là Năm.
        trend_query = self.db.query(
            cast(Transaction.transaction_date, Date).label("date_label"),
            Transaction.type,
            func.sum(Transaction.amount).label("amount")
        ).filter(
            Transaction.user_id == user_id,
            Transaction.type.in_([TransactionType.INCOME, TransactionType.EXPENSE]),
            Transaction.transaction_date.between(start_date, end_date)
        ).group_by(cast(Transaction.transaction_date, Date), Transaction.type).order_by("date_label").all()

        # Xử lý dữ liệu thô thành mảng cho Frontend vẽ Line Chart dễ nhất
        trend_dict = {}
        for date_label, tx_type, amount in trend_query:
            # Format ngày thành String (VD: "2026-04-11")
            lbl = date_label.strftime("%Y-%m-%d")
            if lbl not in trend_dict:
                trend_dict[lbl] = {"time_label": lbl, "income": 0.0, "expense": 0.0}
            
            if tx_type == TransactionType.INCOME: trend_dict[lbl]["income"] = float(amount)
            if tx_type == TransactionType.EXPENSE: trend_dict[lbl]["expense"] = float(amount)

        return {
            "summary": summary,
            "category_breakdown":[{"category_name": r.category_name, "color": r.color, "amount": float(r.amount)} for r in category_data],
            "trend_data": list(trend_dict.values())
        }