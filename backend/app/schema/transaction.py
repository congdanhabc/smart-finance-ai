from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional
from app.model.transaction import TransactionType

class TransactionBase(BaseModel):
    amount: float = Field(..., gt=0, description="Số tiền phải lớn hơn 0") 
    description: Optional[str] = None
    transaction_date: Optional[datetime] = None

class TransactionCreate(TransactionBase):
    wallet_id: str
    category_id: str

class TransferCreate(TransactionBase):
    from_wallet_id: str
    to_wallet_id: str

class TransactionUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    category_id: Optional[str] = None
    description: Optional[str] = None
    transaction_date: Optional[datetime] = None

class CategorySimple(BaseModel):
    id: str
    name: str
    icon: Optional[str] = None
    color: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class WalletSimple(BaseModel):
    id: str
    name: str
    type: str
    model_config = ConfigDict(from_attributes=True)

class TransactionResponse(TransactionBase):
    id: str
    wallet_id: str
    to_wallet_id: Optional[str] = None
    category_id: Optional[str] = None
    type: TransactionType
    created_at: datetime

    category: Optional[CategorySimple] = None
    wallet: Optional[WalletSimple] = None
    wallet_to: Optional[WalletSimple] = None

    model_config = ConfigDict(from_attributes=True)