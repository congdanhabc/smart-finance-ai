from sqlalchemy.orm import Session
from app.core.pagination import QueryParams
from app.repository.base import BaseRepository
from app.model.wallet import Wallet
from app.schema.wallet import WalletCreate, WalletUpdate

class WalletRepository(BaseRepository[Wallet, WalletCreate, WalletUpdate]):
    def __init__(self, db: Session):
        super().__init__(model=Wallet, db=db)
    
    def get_by_user_paginated(self, user_id: str, params: QueryParams):
        query = self.db.query(Wallet).filter(Wallet.user_id == user_id)
        
        if params.search:
            query = query.filter(Wallet.name .ilike(f"%{params.search}%"))
            
        return self.get_paginated(query, params)
    
    def get_all_by_user(self, user_id: str):
        """Hàm dùng cho AI. Chỉ lấy các ví CÒN HOẠT ĐỘNG"""
        return self.db.query(Wallet).filter(
            Wallet.user_id == user_id,
            Wallet.is_active == True
        ).all()