from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime
from app.model.transaction import TransactionType

# Các Ý định (Intent) mà AI có thể nhận diện
class AIIntent(str, Enum):
    ENTRY = "ENTRY"       # Nhập liệu giao dịch mới
    QUERY = "QUERY"       # Truy vấn/Hỏi đáp số liệu (VD: Tháng qua tiêu bao nhiêu?)
    ADVICE = "ADVICE"     # Cố vấn/Dự đoán/Lập kế hoạch tiết kiệm
    ANOMALY = "ANOMALY"   # Phát hiện bất thường

class ChatMessageHistory(BaseModel):
    role: str = Field(..., description="'user' hoặc 'model'")
    text: str

class ChatRequest(BaseModel):
    message: str = Field(..., description="Câu chat mới nhất của người dùng")
    history: Optional[List[ChatMessageHistory]] = Field(default=[], description="Lịch sử 5-10 tin nhắn gần nhất")

class TransactionDraft(BaseModel):
    amount: float
    type: TransactionType
    wallet_id: Optional[str] = None
    category_id: Optional[str] = None
    from_wallet_id: Optional[str] = None 
    to_wallet_id: Optional[str] = None   
    description: str
    transaction_date: datetime

class ChatResponse(BaseModel):
    intent: AIIntent
    message: str = Field(..., description="Câu trả lời của AI hiển thị lên màn hình chat")
    transaction_draft: Optional[TransactionDraft] = None

class ReceiptScanResponse(BaseModel):
    detail: str = Field(..., description="Thông báo trạng thái (thành công hay lỗi mờ ảnh)")
    transaction_draft: Optional[TransactionDraft] = None