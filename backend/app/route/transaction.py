from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db

from app.core.pagination import QueryParams
from app.core.security import get_current_user
from app.model.user import User

from app.schema.pagination import PaginatedResponse
from app.schema.transaction import TransactionCreate, TransactionUpdate, TransferCreate, TransactionResponse
from app.repository.transaction import TransactionRepository
from app.repository.wallet import WalletRepository
from app.service.transaction import TransactionService
from app.controller.transaction import TransactionController

router = APIRouter()

def get_tx_controller(db: Session = Depends(get_db)) -> TransactionController:
    wallet_repo = WalletRepository(db)
    tx_repo = TransactionRepository(db)
    service = TransactionService(tx_repo, wallet_repo)
    return TransactionController(service)

@router.post("/expense", response_model=TransactionResponse)
def add_expense(
    data: TransactionCreate, 
    current_user: User = Depends(get_current_user), # Bắt buộc có token
    controller: TransactionController = Depends(get_tx_controller)
):
    return controller.handle_create_expense(current_user.id, data)

@router.post("/income", response_model=TransactionResponse)
def add_income(
    data: TransactionCreate, 
    current_user: User = Depends(get_current_user),
    controller: TransactionController = Depends(get_tx_controller)
):
    return controller.handle_create_income(current_user.id, data)

@router.post("/transfer", response_model=TransactionResponse)
def add_transfer(
    data: TransferCreate, 
    current_user: User = Depends(get_current_user),
    controller: TransactionController = Depends(get_tx_controller)
):
    return controller.handle_create_transfer(current_user.id, data)

@router.get("/", response_model=PaginatedResponse[TransactionResponse])
def get_all_transactions(
    params: QueryParams = Depends(),
    current_user: User = Depends(get_current_user),
    controller: TransactionController = Depends(get_tx_controller)
):
    return controller.handle_get_all(current_user.id, params)

# ================= 5. SỬA GIAO DỊCH =================
@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: str,
    data: TransactionUpdate, # Dùng đúng Schema Update (Các trường đều Optional)
    current_user: User = Depends(get_current_user),
    controller: TransactionController = Depends(get_tx_controller)
):
    return controller.handle_update_transaction(current_user.id, transaction_id, data)


# ================= 6. XÓA GIAO DỊCH =================
@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    controller: TransactionController = Depends(get_tx_controller)
):
    return controller.handle_delete_transaction(current_user.id, transaction_id)