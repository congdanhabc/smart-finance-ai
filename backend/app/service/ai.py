import json
import re
from datetime import datetime, timezone
from fastapi import HTTPException, UploadFile
from google import genai
from google.genai import types
from app.core.config import settings
from app.model.user import User
from app.repository.wallet import WalletRepository
from app.repository.category import CategoryRepository
from app.repository.transaction import TransactionRepository
from app.schema.ai import ChatRequest
from app.core.logger import logger


class AIService:
    def __init__(self, wallet_repo: WalletRepository, cat_repo: CategoryRepository, tx_repo: TransactionRepository):
        self.wallet_repo = wallet_repo
        self.category_repo = cat_repo
        self.tx_repo = tx_repo

    def process_chat(self, user_id: str, data: ChatRequest):
        user = self.wallet_repo.db.query(User).filter(User.id == user_id).first()

        if (user and user.gemini_api_key):
            api_key = user.gemini_api_key
        else:
            raise HTTPException(status_code=400, detail="Bạn cần thêm gemini api key trong phần cài đặt trước khi dùng Trợ lý AI.")

        client = genai.Client(api_key=api_key)

        # 1. RÚT TRÍCH NGỮ CẢNH
        wallets = self.wallet_repo.get_all_by_user(user_id)
        categories = self.category_repo.get_all_by_user(user_id)
        financial_history = self.tx_repo.get_recent_history_for_ai(user_id, days=30)

        if not wallets:
            raise HTTPException(status_code=400, detail="Bạn cần tạo ít nhất 1 tài khoản/ví trước khi dùng Trợ lý AI.")

        # 2. XỬ LÝ FORMAT DỮ LIỆU
        wallet_ctx = ", ".join([f"{{id: '{w.id}', name: '{w.name}', type: '{w.type}'}}" for w in wallets])
        cat_ctx = ", ".join([f"{{id: '{c.id}', name: '{c.name}', type: '{c.type}'}}" for c in categories])
        current_time = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")

        # 3. XÂY DỰNG PROMPT
        system_instruction = f"""
        Bạn là Trợ lý Tài chính Cá nhân AI (Finbot). Hiện tại là: {current_time}.
        
        THÔNG TIN TÀI CHÍNH CỦA NGƯỜI DÙNG NÀY ĐỂ BẠN CÁ NHÂN HÓA:
        - Các Ví đang có: [{wallet_ctx}]
        - Các Danh mục: [{cat_ctx}]
        - Lịch sử chi tiêu 30 ngày qua (JSON): {json.dumps(financial_history, ensure_ascii=False)}

        NHIỆM VỤ: Phân tích câu nói của người dùng và trả về 1 chuỗi JSON hợp lệ (Không Markdown):
        {{
            "intent": "ENTRY" | "QUERY" | "ADVICE" | "ANOMALY",
            "message": "Câu trả lời thân thiện của bạn",
            "transaction_draft": null hoặc {{ 
                "amount": float, 
                "type": "INCOME"|"EXPENSE"|"TRANSFER", 
                "wallet_id": "str" (Dùng cho INCOME/EXPENSE), 
                "category_id": "str", 
                "from_wallet_id": "str" (Chỉ dùng khi type là TRANSFER),
                "to_wallet_id": "str" (Chỉ dùng khi type là TRANSFER),
                "description": "str", 
                "transaction_date": "YYYY-MM-DDTHH:MM:SS"
            }}
        }}
        """

        try:
            formatted_history =[]
            if data.history:
                for msg in data.history:
                    role = "user" if msg.role == "user" else "model"
                    formatted_history.append(
                        types.Content(role=role, parts=[types.Part.from_text(text=msg.text)])
                    )

            # 3. GỌI API 
            chat_config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.2,
                response_mime_type="application/json"
            )

            # Tạo Chat Session
            chat = client.chats.create(
                model='gemini-3-flash-preview',
                config=chat_config,
                history=formatted_history
            )

            # Gửi tin nhắn
            response = chat.send_message(data.message)

            if not response.text:
                logger.error("Gemini returned an empty response (possibly blocked by safety filters).")
                raise HTTPException(status_code=500, detail="Trợ lý AI không thể trả lời câu hỏi này.")
            
            raw_text = response.text.strip()
            raw_text = re.sub(r'^```json\n', '', raw_text)
            raw_text = re.sub(r'\n```$', '', raw_text)
            
            return json.loads(raw_text)

        except Exception as e:
            error_str = str(e)
            logger.error(f"AI Service Error: {error_str}")
            
            # Nếu Google báo hết Quota hoặc Rate Limit
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                raise HTTPException(
                    status_code=429,
                    detail="Trợ lý AI đang phục vụ quá nhiều yêu cầu. Vui lòng đợi 1 phút rồi thử lại nhé!"
                )
            
            raise HTTPException(status_code=500, detail="Trợ lý AI đang bận. Vui lòng thử lại sau.")
        

    async def scan_receipt(self, user_id: str, file: UploadFile):
        user = self.wallet_repo.db.query(User).filter(User.id == user_id).first()

        if (user and user.gemini_api_key):
            api_key = user.gemini_api_key
        else:
            raise HTTPException(status_code=400, detail="Bạn cần thêm gemini api key trong phần cài đặt trước khi dùng Trợ lý AI.")

        client = genai.Client(api_key=api_key)


        # 1. Lấy danh sách Danh mục và Ví để AI đối chiếu
        wallets = self.wallet_repo.get_all_by_user(user_id)
        categories = self.category_repo.get_all_by_user(user_id)

        wallet_ctx = ", ".join([f"{{id: '{w.id}', name: '{w.name}'}}" for w in wallets])
        cat_ctx = ", ".join([f"{{id: '{c.id}', name: '{c.name}'}}" for c in categories])
        current_time = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")

        # 2. Đọc file ảnh dưới dạng bytes
        image_bytes = await file.read()

        if not file.content_type:
            logger.error(f"User {user_id} uploaded a file without content_type")
            raise HTTPException(status_code=400, detail="Could not determine the file type.")
        
        # 3. Prompt cho Vision AI
        prompt = f"""
        Bạn là một chuyên gia kế toán. Hãy đọc hình ảnh hóa đơn/biên lai này và trích xuất thông tin giao dịch.
        
        NGỮ CẢNH HỆ THỐNG:
        - Thời gian hiện tại: {current_time}
        - Danh sách ID Ví: [{wallet_ctx}]
        - Danh sách ID Danh mục: [{cat_ctx}]

        QUY TẮC TRÍCH XUẤT:
        1. amount: Tìm TỔNG TIỀN THANH TOÁN cuối cùng (Ghi số thực, VD: 150000).
        2. type: Mặc định hóa đơn là "EXPENSE".
        3. description: Lấy tên Quán/Cửa hàng hoặc tóm tắt các món đồ chính (VD: "Phở Tuấn" hoặc "Đi siêu thị Coopmart").
        4. transaction_date: Tìm ngày giờ trên hóa đơn (Format YYYY-MM-DDTHH:MM:SS). Nếu không thấy, dùng Thời gian hiện tại.
        5. category_id: Khớp nội dung hóa đơn với 1 danh mục phù hợp nhất trong Danh sách Danh mục. Nếu không chắc, để null.
        6. wallet_id: Để null (Vì hóa đơn hiếm khi ghi rõ trả bằng ví nào của user).

        BẮT BUỘC TRẢ VỀ CHUỖI JSON HỢP LỆ (Không kèm Markdown) theo cấu trúc:
        {{
            "amount": float,
            "type": "EXPENSE",
            "wallet_id": null,
            "category_id": "str" hoặc null,
            "description": "str",
            "transaction_date": "str"
        }}
        """

        try:
            # 4. GỌI API
            config = types.GenerateContentConfig(
                temperature=0.1,
                response_mime_type="application/json"
            )
            
            response = client.models.generate_content(
                model='gemini-3-flash-preview',
                contents=[
                    prompt, 
                    types.Part.from_bytes(data=image_bytes, mime_type=file.content_type)
                ],
                config=config
            )

            if not response.text:
                logger.error("Gemini returned an empty response (possibly blocked by safety filters).")
                raise HTTPException(status_code=500, detail="Trợ lý AI không thể trả lời câu hỏi này.")

            raw_text = response.text.strip()
            raw_text = re.sub(r'^```json\n', '', raw_text)
            raw_text = re.sub(r'\n```$', '', raw_text)
            
            draft_data = json.loads(raw_text)
            
            return {
                "detail": "Quét hóa đơn thành công!",
                "transaction_draft": draft_data
            }

        except Exception as e:
            error_str = str(e)
            logger.error(f"OCR Error for user {user_id}: {error_str}")
            
            # Nếu Google báo hết Quota hoặc Rate Limit
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                raise HTTPException(
                    status_code=429,
                    detail="Trợ lý AI đang phục vụ quá nhiều yêu cầu. Vui lòng đợi 1 phút rồi thử lại nhé!"
                )
           
            raise HTTPException(status_code=400, detail="Không thể đọc được hóa đơn này.")