from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db

from app.core.pagination import QueryParams
from app.core.security import get_current_user 
from app.model.user import User

from app.schema.pagination import PaginatedResponse
from app.schema.wallet import WalletCreate, WalletResponse, WalletDeposit, WalletUpdate
from app.repository.wallet import WalletRepository
from app.repository.transaction import TransactionRepository
from app.service.wallet import WalletService
from app.controller.wallet import WalletController

router = APIRouter()

def get_wallet_controller(db: Session = Depends(get_db)) -> WalletController:
    wallet_repo = WalletRepository(db)
    transaction_repo = TransactionRepository(db)
    service = WalletService(wallet_repo, transaction_repo)
    return WalletController(service)

# ================= API ENDPOINTS =================
@router.get("/", response_model=PaginatedResponse[WalletResponse])
def get_wallets(
    params: QueryParams = Depends(),
    current_user: User = Depends(get_current_user), # Bắt buộc có token
    controller: WalletController = Depends(get_wallet_controller)
):
    return controller.get_my_wallets(current_user.id, params)

@router.post("/", response_model=WalletResponse)
def create_wallet(
    data: WalletCreate,
    current_user: User = Depends(get_current_user),
    controller: WalletController = Depends(get_wallet_controller)
):
    return controller.create_wallet(current_user.id, data)

@router.post("/{wallet_id}/deposit", response_model=WalletResponse)
def deposit_wallet(
    wallet_id: str,
    data: WalletDeposit,
    current_user: User = Depends(get_current_user),
    controller: WalletController = Depends(get_wallet_controller)
):
    return controller.deposit_to_wallet(current_user.id, wallet_id, data)

@router.delete("/{wallet_id}")
def delete_wallet(
    wallet_id: str,
    current_user: User = Depends(get_current_user),
    controller: WalletController = Depends(get_wallet_controller)
):
    return controller.handle_delete_wallet(current_user.id, wallet_id)

@router.put("/{wallet_id}", response_model=WalletResponse)
def update_wallet(
    wallet_id: str,
    data: WalletUpdate,
    current_user: User = Depends(get_current_user),
    controller: WalletController = Depends(get_wallet_controller)
):
    # Truyền ID thật của người dùng và ID ví xuống dưới
    return controller.handle_update_wallet(current_user.id, wallet_id, data)