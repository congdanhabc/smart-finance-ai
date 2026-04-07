from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional
from app.model.wallet import WalletType

class WalletCreate(BaseModel):
    name: str = Field(..., min_length=1, description="Tên ví")
    type: WalletType
    initial_balance: float = 0.0 # Cho phép nhập số dư ban đầu

class WalletUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[WalletType] = None

class WalletResponse(BaseModel):
    id: str
    name: str
    type: WalletType
    balance: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class WalletDeposit(BaseModel):
    amount: float = Field(..., gt=0, description="Số tiền nạp phải > 0")
    description: Optional[str] = "Nạp tiền vào ví"
    transaction_date: datetime 