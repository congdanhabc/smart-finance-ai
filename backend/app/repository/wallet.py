from sqlalchemy.orm import Session
from app.repository.base import BaseRepository
from app.model.wallet import Wallet
from app.schema.wallet import WalletCreate, WalletUpdate

class WalletRepository(BaseRepository[Wallet, WalletCreate, WalletUpdate]):
    def __init__(self, db: Session):
        super().__init__(model=Wallet, db=db)

    # Hàm đặc thù: Lấy tất cả ví của 1 user cụ thể
    def get_by_user_id(self, user_id: str) -> list[Wallet]:
        return self.db.query(Wallet).filter(Wallet.user_id == user_id).all()