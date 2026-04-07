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

class TransactionResponse(TransactionBase):
    id: str
    wallet_id: str
    to_wallet_id: Optional[str] = None
    category_id: Optional[str] = None 
    
    type: TransactionType
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)