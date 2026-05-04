from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional
from app.model.wallet import WalletType

class WalletCreate(BaseModel):
    name: str = Field(..., min_length=1, description="Tên ví")
    type: WalletType
    initial_balance: float = 0.0 # Cho phép nhập số dư ban đầu

class WalletUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, description="Tên ví mới")
    is_active: Optional[bool] = Field(None, description="Trạng thái đóng/mở ví")

class WalletResponse(BaseModel):
    id: str
    name: str
    type: WalletType
    balance: float
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class WalletDeposit(BaseModel):
    amount: float = Field(..., gt=0, description="Số tiền nạp phải > 0")
    description: Optional[str] = "Nạp tiền vào ví"
    transaction_date: datetime 