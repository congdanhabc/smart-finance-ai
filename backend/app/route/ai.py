from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.model.user import User

from app.schema.ai import ChatRequest, ChatResponse, ReceiptScanResponse
from app.repository.wallet import WalletRepository
from app.repository.category import CategoryRepository
from app.repository.transaction import TransactionRepository
from app.service.ai import AIService
from app.controller.ai import AIController

router = APIRouter()

def get_ai_controller(db: Session = Depends(get_db)) -> AIController:
    wallet_repo = WalletRepository(db)
    cat_repo = CategoryRepository(db)
    tx_repo = TransactionRepository(db)
    service = AIService(wallet_repo, cat_repo, tx_repo)
    return AIController(service)

# ================= CHATBOT =================
@router.post("/chat", response_model=ChatResponse)
def chat_with_bot(
    data: ChatRequest,
    current_user: User = Depends(get_current_user),
    controller: AIController = Depends(get_ai_controller)
):
    return controller.handle_chat(current_user.id, data)

# ================= QUÉT HÓA ĐƠN TỰ ĐỘNG =================
# Giới hạn kích thước file (Ví dụ: 5MB)
MAX_FILE_SIZE = 5 * 1024 * 1024 
ALLOWED_TYPES =["image/jpeg", "image/png", "image/webp", "image/heic"]

@router.post("/scan-receipt", response_model=ReceiptScanResponse)
async def scan_receipt(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    controller: AIController = Depends(get_ai_controller)
):
    # 1. Validation định dạng file
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400, 
            detail="Định dạng file không được hỗ trợ. Vui lòng tải lên ảnh JPG, PNG hoặc WEBP."
        )
    
    # 2. Validation kích thước file
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Dung lượng ảnh quá lớn. Tối đa 5MB.")

    await file.seek(0)

    return await controller.handle_scan_receipt(current_user.id, file)