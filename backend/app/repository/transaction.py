from sqlalchemy.orm import Session
from app.core.pagination import QueryParams
from app.repository.base import BaseRepository
from app.model.transaction import Transaction
from app.schema.transaction import TransactionCreate, TransactionUpdate 
from datetime import datetime, timedelta, timezone

class TransactionRepository(BaseRepository[Transaction, TransactionCreate, TransactionUpdate]):
    def __init__(self, db: Session):
        super().__init__(model=Transaction, db=db)

    def get_by_user_paginated(self, user_id: str, params: QueryParams):
        query = self.db.query(Transaction).filter(Transaction.user_id == user_id)
        
        if params.search:
            query = query.filter(Transaction.description.ilike(f"%{params.search}%"))
            
        return self.get_paginated(query, params)
    
    def get_recent_history_for_ai(self, user_id: str, days: int = 30):
        """Lấy lịch sử giao dịch N ngày gần nhất để làm ngữ cảnh (Context) cho AI"""
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        transactions = self.db.query(
            self.model.amount,
            self.model.type,
            self.model.description,
            self.model.transaction_date,
            self.model.category_id
        ).filter(
            self.model.user_id == user_id,
            self.model.transaction_date >= start_date
        ).order_by(self.model.transaction_date.desc()).all()
        
        return[
            {
                "date": tx.transaction_date.strftime("%Y-%m-%d"),
                "amount": float(tx.amount),
                "type": tx.type.value,
                "desc": tx.description,
                "cat_id": tx.category_id
            } for tx in transactions
        ]