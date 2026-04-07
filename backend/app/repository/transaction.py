from sqlalchemy.orm import Session
from app.repository.base import BaseRepository
from app.model.transaction import Transaction
from app.schema.transaction import TransactionCreate, TransactionUpdate 

class TransactionRepository(BaseRepository[Transaction, TransactionCreate, TransactionUpdate]):
    def __init__(self, db: Session):
        super().__init__(model=Transaction, db=db)

    def get_by_user(self, user_id: str, skip: int = 0, limit: int = 100):
        # Trả về danh sách giao dịch, sắp xếp mới nhất lên đầu
        return self.db.query(Transaction)\
            .filter(Transaction.user_id == user_id)\
            .order_by(Transaction.transaction_date.desc())\
            .offset(skip).limit(limit).all()