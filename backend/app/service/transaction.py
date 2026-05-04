from fastapi import HTTPException
from datetime import datetime, timezone
from app.core.pagination import QueryParams
from app.repository.transaction import TransactionRepository
from app.repository.wallet import WalletRepository
from app.schema.transaction import TransactionCreate, TransactionUpdate, TransferCreate
from app.model.transaction import TransactionType
from app.model.wallet import WalletType

class TransactionService:
    def __init__(self, tx_repo: TransactionRepository, wallet_repo: WalletRepository):
        self.tx_repo = tx_repo
        self.wallet_repo = wallet_repo

    # ================= GHI NHẬN CHI TIÊU (EXPENSE) =================
    def create_expense(self, user_id: str, data: TransactionCreate):
        wallet = self.wallet_repo.get(data.wallet_id)
        if not wallet or str(wallet.user_id) != str(user_id):
            raise HTTPException(status_code=404, detail="Không tìm thấy ví.")

        # Lấy giá trị thực của Enum để so sánh an toàn tuyệt đối
        wallet_type_val = wallet.type.value if hasattr(wallet.type, "value") else str(wallet.type)

        if wallet_type_val == WalletType.LOAN.value:
            raise HTTPException(
                status_code=400, 
                detail="Không thể chi tiêu từ Khoản vay. Hãy dùng chức năng Chuyển khoản (Transfer) sang ví Tiền mặt/Ngân hàng trước."
            )

        # Chỉ Thẻ Tín Dụng và Khoản Nợ mới được phép có số dư Âm
        new_balance = float(wallet.balance) - float(data.amount)
        if wallet_type_val not in[WalletType.CREDIT_CARD.value, WalletType.LOAN.value] and new_balance < 0:
            raise HTTPException(
                status_code=400, 
                detail=f"Số dư ví không đủ! Ví này chỉ còn {float(wallet.balance):,.0f} đ."
            )
        wallet.balance = new_balance

        new_tx = self.tx_repo.create(
            obj_in=data,
            commit=False,
            user_id=user_id,
            type=TransactionType.EXPENSE,
            transaction_date=data.transaction_date or datetime.now(timezone.utc)
        )
        
        self.tx_repo.commit()
        return new_tx

    # ================= GHI NHẬN THU NHẬP (INCOME) =================
    def create_income(self, user_id: str, data: TransactionCreate):
        wallet = self.wallet_repo.get(data.wallet_id)
        if not wallet or str(wallet.user_id) != str(user_id):
            raise HTTPException(status_code=404, detail="Không tìm thấy ví.")

        wallet.balance = float(wallet.balance) + float(data.amount)

        new_tx = self.tx_repo.create(
            obj_in=data,
            commit=False,
            user_id=user_id,
            type=TransactionType.INCOME,
            transaction_date=data.transaction_date or datetime.now(timezone.utc)
        )
        self.tx_repo.commit()
        return new_tx

    # ================= CHUYỂN TIỀN GIỮA CÁC VÍ (TRANSFER) =================
    def create_transfer(self, user_id: str, data: TransferCreate):
        if str(data.from_wallet_id) == str(data.to_wallet_id):
            raise HTTPException(status_code=400, detail="Không thể chuyển tiền vào cùng một ví.")

        from_wallet = self.wallet_repo.get(str(data.from_wallet_id))
        to_wallet = self.wallet_repo.get(str(data.to_wallet_id))

        if not from_wallet or not to_wallet or str(from_wallet.user_id) != str(user_id) or str(to_wallet.user_id) != str(user_id):
            raise HTTPException(status_code=404, detail="Ví nguồn hoặc ví đích không hợp lệ.")

        from_wallet_type_val = from_wallet.type.value if hasattr(from_wallet.type, "value") else str(from_wallet.type)
        new_from_balance = float(from_wallet.balance) - float(data.amount)
        
        if from_wallet_type_val not in [WalletType.CREDIT_CARD.value, WalletType.LOAN.value] and new_from_balance < 0:
            raise HTTPException(
                status_code=400, 
                detail=f"Số dư ví nguồn không đủ để chuyển. Ví chỉ còn {float(from_wallet.balance):,.0f} đ."
            )


        from_wallet.balance = new_from_balance
        to_wallet.balance = float(to_wallet.balance) + float(data.amount)

        tx_data = data.model_dump(exclude={"from_wallet_id", "to_wallet_id"}, exclude_unset=True)

        new_tx = self.tx_repo.create(
            obj_in=tx_data,
            commit=False,
            user_id=user_id,
            category_id=None,
            type=TransactionType.TRANSFER,
            description=data.description or "Chuyển tiền nội bộ",
            transaction_date=data.transaction_date or datetime.now(timezone.utc)
        )
        self.tx_repo.commit()
        return new_tx

    # ================= LẤY LIST GIAO DỊCH =================
    def get_user_transactions(self, user_id: str, params: QueryParams):
        return self.tx_repo.get_by_user_paginated(user_id, params)
    
    # ================= XÓA GIAO DỊCH =================
    def delete_transaction(self, user_id: str, transaction_id: str):
        tx = self.tx_repo.get(transaction_id)
        if not tx or str(tx.user_id) != str(user_id):
            raise HTTPException(status_code=404, detail="Không tìm thấy giao dịch.")

        # Lấy ví nguồn 
        wallet = self.wallet_repo.get(str(tx.wallet_id))

        if tx.type == TransactionType.EXPENSE:
            if wallet: # CHỈ HOÀN TIỀN NẾU VÍ CÒN TỒN TẠI
                wallet.balance = float(wallet.balance) + float(tx.amount)
                
        elif tx.type == TransactionType.INCOME:
            if wallet:
                wallet.balance = float(wallet.balance) - float(tx.amount)
                
        elif tx.type == TransactionType.TRANSFER:
            if wallet:
                wallet.balance = float(wallet.balance) + float(tx.amount)
            
            if tx.to_wallet_id:
                to_wallet = self.wallet_repo.get(str(tx.to_wallet_id))
                if to_wallet: # CHỈ TRỪ TIỀN NẾU VÍ ĐÍCH CÒN TỒN TẠI
                    to_wallet.balance = float(to_wallet.balance) - float(tx.amount)

        # Bất chấp ví còn hay mất, giấy nợ (transaction) vẫn phải được hủy
        self.tx_repo.delete(tx.id, commit=False)
        self.tx_repo.commit()
        
        return {"detail": "Xóa giao dịch thành công."}

    # ================= SỬA GIAO DỊCH =================
    def update_transaction(self, user_id: str, transaction_id: str, data: TransactionUpdate):
        tx = self.tx_repo.get(transaction_id)
        if not tx or str(tx.user_id) != str(user_id):
            raise HTTPException(status_code=404, detail="Không tìm thấy giao dịch.")

        wallet = self.wallet_repo.get(str(tx.wallet_id))
        if not wallet:
            raise HTTPException(status_code=404, detail="Ví nguồn không còn tồn tại.")

        if data.amount is not None and float(data.amount) != float(tx.amount):
            delta = float(data.amount) - float(tx.amount)

            wallet_type_val = wallet.type.value if hasattr(wallet.type, "value") else str(wallet.type)
            is_debt_wallet = wallet_type_val in [WalletType.CREDIT_CARD.value, WalletType.LOAN.value]

            if tx.type == TransactionType.EXPENSE:
                new_balance = float(wallet.balance) - delta
                if not is_debt_wallet and new_balance < 0:
                    raise HTTPException(status_code=400, detail="Không thể cập nhật. Số dư ví không đủ để chịu khoản chi phí tăng thêm này.")
                wallet.balance = new_balance

            elif tx.type == TransactionType.INCOME:
                wallet.balance = float(wallet.balance) + delta

            elif tx.type == TransactionType.TRANSFER:
                new_balance = float(wallet.balance) - delta
                if not is_debt_wallet and new_balance < 0:
                    raise HTTPException(status_code=400, detail="Không thể cập nhật. Số dư ví nguồn không đủ.")
                wallet.balance = new_balance
                
                if tx.to_wallet_id:
                    to_wallet = self.wallet_repo.get(str(tx.to_wallet_id))
                    if to_wallet:
                        to_wallet.balance = float(to_wallet.balance) + delta

        # DÙNG REPO UPDATE ĐỂ CẬP NHẬT
        updated_tx = self.tx_repo.update(
            db_obj=tx, 
            obj_in=data, 
            commit=False
        )
        self.tx_repo.commit()
        
        return updated_tx