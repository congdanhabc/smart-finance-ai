from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
# from app.core.security import get_current_user # Lấy JWT thực tế

from app.schema.transaction import TransactionCreate, TransferCreate, TransactionResponse
from app.repository.transaction import TransactionRepository
from app.repository.wallet import WalletRepository
from app.service.transaction import TransactionService
from app.controller.transaction import TransactionController

router = APIRouter()

# Dây chuyền Dependency Injection đỉnh cao:
def get_tx_controller(db: Session = Depends(get_db)) -> TransactionController:
    wallet_repo = WalletRepository(db)
    tx_repo = TransactionRepository(db)
    # Service cầm cả 2 kho (Wallet và Tx) để xử lý logic trừ tiền và ghi log cùng lúc
    service = TransactionService(tx_repo, wallet_repo)
    return TransactionController(service)


@router.post("/expense", response_model=TransactionResponse)
def add_expense(
    data: TransactionCreate, 
    # current_user = Depends(get_current_user),
    controller: TransactionController = Depends(get_tx_controller)
):
    user_id = "user_id_test" # Tạm thay bằng ID giả để test trên Postman
    return controller.handle_create_expense(user_id, data)


@router.post("/income", response_model=TransactionResponse)
def add_income(
    data: TransactionCreate, 
    controller: TransactionController = Depends(get_tx_controller)
):
    user_id = "user_id_test"
    return controller.handle_create_income(user_id, data)


@router.post("/transfer", response_model=TransactionResponse)
def add_transfer(
    data: TransferCreate, 
    controller: TransactionController = Depends(get_tx_controller)
):
    user_id = "user_id_test"
    return controller.handle_create_transfer(user_id, data)


@router.get("/", response_model=List[TransactionResponse])
def get_all_transactions(
    controller: TransactionController = Depends(get_tx_controller)
):
    user_id = "user_id_test"
    return controller.handle_get_all(user_id)