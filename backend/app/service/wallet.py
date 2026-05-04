from fastapi import HTTPException
from app.core.pagination import QueryParams
from app.repository.wallet import WalletRepository
from app.repository.transaction import TransactionRepository
from app.schema.wallet import WalletCreate, WalletDeposit, WalletUpdate
from app.model.transaction import TransactionType
from datetime import datetime, timezone

class WalletService:
    def __init__(self, wallet_repo: WalletRepository, transaction_repo: TransactionRepository):
        self.wallet_repo = wallet_repo
        self.transaction_repo = transaction_repo

    def create_wallet(self, user_id: str, data: WalletCreate):
        # 1. LỌC BỎ trường không có trong Database
        wallet_data = data.model_dump(exclude={"initial_balance"})

        # 2. Tạo Ví (Tự tay map giá trị vào cột 'balance')
        new_wallet = self.wallet_repo.create(
            obj_in=wallet_data, # Truyền dict đã lọc
            commit=False, 
            user_id=user_id, 
            balance=data.initial_balance # <--- Chỉ định rõ cột balance nhận giá trị này
        )

        # 3. Tạo Transaction (Nếu có số dư ban đầu)
        if data.initial_balance > 0:
            self.transaction_repo.create(
                obj_in={
                    "amount": data.initial_balance,
                    "description": "Khởi tạo số dư ban đầu",
                },
                commit=False,
                user_id=user_id,
                wallet_id=new_wallet.id,
                type=TransactionType.INCOME,
                transaction_date=datetime.now(timezone.utc)
            )

        # 4. CHỐT SỔ
        self.wallet_repo.commit()
        return new_wallet

    def get_user_wallets(self, user_id: str, params: QueryParams):
        return self.wallet_repo.get_by_user_paginated(user_id, params)

    def deposit_money(self, user_id: str, wallet_id: str, data: WalletDeposit):
        wallet = self.wallet_repo.get(wallet_id)
        if not wallet or str(wallet.user_id) != str(user_id):
            raise HTTPException(status_code=404, detail="Wallet not found.")

        # 1. Cộng tiền
        wallet.balance = float(wallet.balance) + data.amount

        # 2. Tạo Giao dịch (Không commit ngay)
        self.transaction_repo.create(
            obj_in=data.model_dump(exclude_unset=True), 
            commit=False,
            user_id=user_id,
            wallet_id=wallet.id,
            type=TransactionType.INCOME
        )
        
        # 3. CHỐT SỔ
        self.wallet_repo.commit()
        return wallet
    
    def delete_wallet(self, user_id: str, wallet_id: str):
        wallet = self.wallet_repo.get(wallet_id)
        if not wallet or str(wallet.user_id) != str(user_id):
            raise HTTPException(status_code=404, detail="Không tìm thấy ví.")

        # 1. Ép người dùng rút hết tiền trước khi đóng ví
        if float(wallet.balance) != 0:
            raise HTTPException(
                status_code=400, 
                detail="Không thể xóa ví đang có số dư. Vui lòng chuyển hết tiền sang ví khác trước khi đóng."
            )

        # 2. Xử lý xóa
        if len(wallet.transactions) == 0:
            # Nếu ví trống trơn chưa từng quẹt lần nào -> XÓA THẬT (Hard Delete)
            self.wallet_repo.delete(wallet.id)
            return {"detail": "Đã xóa ví vĩnh viễn."}
        else:
            # Nếu đã có lịch sử giao dịch -> XÓA MỀM (Soft Delete / Archive)
            wallet.is_active = False
            self.wallet_repo.commit()
            return {"detail": "Ví đã được đóng băng. Lịch sử giao dịch vẫn được giữ lại."}
        
    def update_wallet(self, user_id: str, wallet_id: str, data: WalletUpdate):
        # 1. Tìm ví trong DB
        wallet = self.wallet_repo.get(wallet_id)
        
        # 2. Kiểm tra tồn tại và quyền sở hữu
        if not wallet or str(wallet.user_id) != str(user_id):
            raise HTTPException(status_code=404, detail="Không tìm thấy ví hoặc bạn không có quyền sửa.")

        # 3. Dùng BaseRepository để tự động cập nhật các trường được gửi lên
        updated_wallet = self.wallet_repo.update(
            db_obj=wallet, 
            obj_in=data
        )
        
        return updated_wallet