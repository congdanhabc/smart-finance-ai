from fastapi import HTTPException
from datetime import datetime, timezone
from app.repository.transaction import TransactionRepository
from app.repository.wallet import WalletRepository
from app.schema.transaction import TransactionCreate, TransactionUpdate, TransferCreate
from app.model.transaction import Transaction, TransactionType
from app.model.wallet import WalletType

class TransactionService:
    def __init__(self, tx_repo: TransactionRepository, wallet_repo: WalletRepository):
        self.tx_repo = tx_repo
        self.wallet_repo = wallet_repo
        # Dùng chung 1 Session DB để đảm bảo tính Nguyên tử (Atomic)
        self.db = tx_repo.db 

    # ================= 1. GHI NHẬN CHI TIÊU (EXPENSE) =================
    def create_expense(self, user_id: str, data: TransactionCreate):
        wallet = self.wallet_repo.get(data.wallet_id)
        if not wallet or wallet.user_id != user_id:
            raise HTTPException(status_code=404, detail="Không tìm thấy ví.")

        # QUY TẮC SỐ 1: CẤM TIÊU TIỀN TRỰC TIẾP TỪ VÍ VAY MƯỢN (LOAN)
        if wallet.type == WalletType.LOAN:
            raise HTTPException(
                status_code=400, 
                detail="Không thể chi tiêu từ Khoản vay. Hãy Transfer tiền vay sang ví Tiền mặt/Ngân hàng trước."
            )

        # 1. Trừ tiền trong ví
        wallet.balance -= data.amount

        # 2. Tạo record Giao dịch
        new_tx = Transaction(
            user_id=user_id,
            wallet_id=wallet.id,
            category_id=data.category_id,
            amount=data.amount,
            type=TransactionType.EXPENSE,
            description=data.description,
            transaction_date=data.transaction_date or datetime.now(timezone.utc)
        )
        self.db.add(new_tx)
        
        # 3. Lưu vào DB cùng 1 lúc (Nếu lỗi sẽ Rollback cả 2)
        self.db.commit()
        return new_tx

    # ================= 2. GHI NHẬN THU NHẬP (INCOME) =================
    def create_income(self, user_id: str, data: TransactionCreate):
        wallet = self.wallet_repo.get(data.wallet_id)
        if not wallet or wallet.user_id != user_id:
            raise HTTPException(status_code=404, detail="Không tìm thấy ví.")

        # Cộng tiền vào ví
        wallet.balance += data.amount

        new_tx = Transaction(
            user_id=user_id,
            wallet_id=wallet.id,
            category_id=data.category_id,
            amount=data.amount,
            type=TransactionType.INCOME,
            description=data.description,
            transaction_date=data.transaction_date or datetime.now(timezone.utc)
        )
        self.db.add(new_tx)
        self.db.commit()
        return new_tx

    # ================= 3. CHUYỂN TIỀN GIỮA CÁC VÍ (TRANSFER) =================
    def create_transfer(self, user_id: str, data: TransferCreate):
        if data.from_wallet_id == data.to_wallet_id:
            raise HTTPException(status_code=400, detail="Không thể chuyển tiền vào cùng một ví.")

        from_wallet = self.wallet_repo.get(data.from_wallet_id)
        to_wallet = self.wallet_repo.get(data.to_wallet_id)

        if not from_wallet or not to_wallet or from_wallet.user_id != user_id or to_wallet.user_id != user_id:
            raise HTTPException(status_code=404, detail="Ví nguồn hoặc ví đích không hợp lệ.")

        # Trừ ví này, cộng ví kia
        from_wallet.balance -= data.amount
        to_wallet.balance += data.amount

        new_tx = Transaction(
            user_id=user_id,
            wallet_id=from_wallet.id,
            to_wallet_id=to_wallet.id,
            category_id=None,
            amount=data.amount,
            type=TransactionType.TRANSFER,
            description=data.description or "Chuyển tiền nội bộ",
            transaction_date=data.transaction_date or datetime.now(timezone.utc)
        )
        self.db.add(new_tx)
        self.db.commit()
        return new_tx

    def get_user_transactions(self, user_id: str):
        return self.tx_repo.get_by_user(user_id)
    
    # ================= 4. XÓA GIAO DỊCH =================
    def delete_transaction(self, user_id: str, transaction_id: str):
        tx = self.tx_repo.get(transaction_id)
        if not tx or tx.user_id != user_id:
            raise HTTPException(status_code=404, detail="Không tìm thấy giao dịch.")

        wallet = self.wallet_repo.get(tx.wallet_id)

        if not wallet:
            # Nếu vì lý do gì đó ví đã bị xóa trước giao dịch này
            raise HTTPException(status_code=404, detail="Source wallet no longer exists.")

        # Trả lại tiền vào ví tùy theo loại giao dịch
        if tx.type == TransactionType.EXPENSE:
            wallet.balance += tx.amount # Xóa chi tiêu -> Trả lại tiền
        elif tx.type == TransactionType.INCOME:
            wallet.balance -= tx.amount # Xóa thu nhập -> Trừ lại tiền
        elif tx.type == TransactionType.TRANSFER:
            wallet.balance += tx.amount # Trả lại ví nguồn
            if tx.to_wallet_id:
                to_wallet = self.wallet_repo.get(tx.to_wallet_id)

                if not to_wallet:
                    raise HTTPException(
                        status_code=404, 
                        detail="Destination wallet not found. Cannot reverse transfer."
                    )

                to_wallet.balance -= tx.amount # Trừ lại ví đích

        # Xóa record
        self.tx_repo.delete(tx.id)
        self.db.commit()
        return {"detail": "Xóa giao dịch thành công và đã cập nhật lại số dư ví."}

    # ================= 5. SỬA GIAO DỊCH (Cách an toàn nhất) =================
    def update_transaction(self, user_id: str, transaction_id: str, data: TransactionUpdate):
        
        # 1. Lấy giao dịch hiện tại từ Database ra
        tx = self.tx_repo.get(transaction_id)
        if not tx or str(tx.user_id) != str(user_id):
            raise HTTPException(status_code=404, detail="Không tìm thấy giao dịch.")

        # Lấy ví liên quan
        wallet = self.wallet_repo.get(str(tx.wallet_id))
        if not wallet:
            raise HTTPException(status_code=404, detail="Ví nguồn không còn tồn tại.")

        # 2. XỬ LÝ SỐ DƯ (Nếu người dùng có thay đổi số tiền)
        if data.amount is not None and float(data.amount) != float(tx.amount):
            # Tính mức chênh lệch = Số mới - Số cũ
            delta = float(data.amount) - float(tx.amount)

            if tx.type == TransactionType.EXPENSE:
                # Tiêu nhiều hơn (delta > 0) -> trừ thêm tiền. Tiêu ít đi -> cộng lại tiền.
                wallet.balance -= delta
                
            elif tx.type == TransactionType.INCOME:
                wallet.balance += delta
                
            elif tx.type == TransactionType.TRANSFER:
                wallet.balance -= delta # Trừ ví nguồn thêm delta
                
                # Cập nhật cả ví đích
                if tx.to_wallet_id:
                    to_wallet = self.wallet_repo.get(str(tx.to_wallet_id))
                    if to_wallet:
                        to_wallet.balance += delta

        # 3. Cập nhật các trường dữ liệu khác (description, date, category...)
        # exclude_unset=True giúp chỉ lấy những trường mà người dùng thực sự gửi lên để sửa
        update_data = data.model_dump(exclude_unset=True)
        
        for key, value in update_data.items():
            setattr(tx, key, value) # Gán giá trị mới vào object tx

        # 4. Lưu vào Database
        self.db.commit()
        self.db.refresh(tx)
        
        return tx