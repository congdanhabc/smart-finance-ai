from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from app.model.transaction import Transaction, TransactionType
from app.model.category import Category

class StatisticService:
    def __init__(self, db: Session):
        self.db = db

    def get_monthly_summary(self, user_id: str, month: int, year: int):
        """Tính tổng Thu/Chi trong 1 tháng cụ thể"""
        result = self.db.query(
            Transaction.type, 
            func.sum(Transaction.amount).label('total')
        ).filter(
            Transaction.user_id == user_id,
            func.extract('month', Transaction.transaction_date) == month,
            func.extract('year', Transaction.transaction_date) == year
        ).group_by(Transaction.type).all()

        summary = {"income": 0.0, "expense": 0.0}
        for tx_type, total in result:
            if tx_type == TransactionType.INCOME: summary["income"] = total
            if tx_type == TransactionType.EXPENSE: summary["expense"] = total
            
        summary["balance"] = summary["income"] - summary["expense"]
        return summary

    def get_expense_by_category(self, user_id: str, month: int, year: int):
        """Tính tổng chi tiêu theo từng Danh mục (Dùng cho Biểu đồ tròn Pie Chart)"""
        result = self.db.query(
            Category.name, 
            Category.color, 
            func.sum(Transaction.amount).label('total')
        ).join(Transaction, Category.id == Transaction.category_id)\
         .filter(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.EXPENSE,
            func.extract('month', Transaction.transaction_date) == month,
            func.extract('year', Transaction.transaction_date) == year
        ).group_by(Category.name, Category.color).all()

        return [{"category": row[0], "color": row[1], "total": row[2]} for row in result]