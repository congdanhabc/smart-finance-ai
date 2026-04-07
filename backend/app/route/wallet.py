from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
# Tạm giả định bạn có hàm lấy user đang đăng nhập (Dependency)
# from app.core.security import get_current_user 

from app.schema.wallet import WalletCreate, WalletResponse, WalletDeposit
from app.repository.wallet import WalletRepository
from app.repository.transaction import TransactionRepository
from app.service.wallet import WalletService
from app.controller.wallet import WalletController

router = APIRouter()

# Dây chuyền DI (Dependency Injection)
def get_wallet_controller(db: Session = Depends(get_db)) -> WalletController:
    wallet_repo = WalletRepository(db)
    transaction_repo = TransactionRepository(db)
    service = WalletService(wallet_repo, transaction_repo)
    return WalletController(service)

# ================= API ENDPOINTS =================

@router.get("/", response_model=List[WalletResponse])
def get_wallets(
    # current_user = Depends(get_current_user), # Xài cái này trong thực tế
    controller: WalletController = Depends(get_wallet_controller)
):
    # Truyền cứng ID user để test tạm nếu chưa code xong get_current_user
    user_id = "user_id_test_cua_ban" 
    return controller.get_my_wallets(user_id)

@router.post("/", response_model=WalletResponse)
def create_wallet(
    data: WalletCreate,
    controller: WalletController = Depends(get_wallet_controller)
):
    user_id = "user_id_test_cua_ban" 
    return controller.create_wallet(user_id, data)

@router.post("/{wallet_id}/deposit", response_model=WalletResponse)
def deposit_wallet(
    wallet_id: str,
    data: WalletDeposit,
    controller: WalletController = Depends(get_wallet_controller)
):
    user_id = "user_id_test_cua_ban" 
    return controller.deposit_to_wallet(user_id, wallet_id, data)