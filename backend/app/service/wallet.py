from fastapi import HTTPException
from app.repository.wallet import WalletRepository
from app.repository.transaction import TransactionRepository
from app.schema.wallet import WalletCreate, WalletDeposit
from app.model.wallet import Wallet
from app.model.transaction import Transaction, TransactionType

class WalletService:
    def __init__(self, wallet_repo: WalletRepository, transaction_repo: TransactionRepository):
        self.wallet_repo = wallet_repo
        self.transaction_repo = transaction_repo
        self.db = wallet_repo.db # Mượn session để dùng chung 1 Transaction (Commit)

    def create_wallet(self, user_id: str, data: WalletCreate):
        # 1. Tạo Ví
        new_wallet = Wallet(
            user_id=user_id,
            name=data.name,
            type=data.type,
            balance=data.initial_balance
        )
        self.db.add(new_wallet)
        self.db.flush() # Đẩy vào DB để lấy ID ví, nhưng chưa commit

        # 2. Nếu có số dư ban đầu, tự động tạo Giao dịch Nạp tiền (Dành cho AI đọc sau này)
        if data.initial_balance > 0:
            initial_tx = Transaction(
                user_id=user_id,
                wallet_id=new_wallet.id,
                amount=data.initial_balance,
                type=TransactionType.INCOME,
                description="Khởi tạo số dư ban đầu",
                # Lấy ngày hiện tại
            )
            self.db.add(initial_tx)

        self.db.commit() # Cập nhật cả 2 bảng cùng lúc
        self.db.refresh(new_wallet)
        return new_wallet

    def get_user_wallets(self, user_id: str):
        return self.wallet_repo.get_by_user_id(user_id)

    # CHỨC NĂNG NẠP TIỀN VÀO VÍ CÓ TIMESTAMP
    def deposit_money(self, user_id: str, wallet_id: str, data: WalletDeposit):
        wallet = self.wallet_repo.get(wallet_id)
        
        # Kiểm tra ví có tồn tại và thuộc về user này không
        if not wallet or wallet.user_id != user_id:
            raise HTTPException(status_code=404, detail="Wallet not found.")

        # 1. Cộng tiền vào ví
        wallet.balance += data.amount

        # 2. Ghi log vào bảng Transaction
        deposit_tx = Transaction(
            user_id=user_id,
            wallet_id=wallet.id,
            amount=data.amount,
            type=TransactionType.INCOME,
            description=data.description,
            transaction_date=data.transaction_date # Dùng mốc thời gian User truyền lên
        )
        self.db.add(deposit_tx)
        
        self.db.commit()
        self.db.refresh(wallet)
        return wallet