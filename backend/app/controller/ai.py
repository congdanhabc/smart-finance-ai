from fastapi import UploadFile

from app.service.ai import AIService
from app.schema.ai import ChatRequest

class AIController:
    def __init__(self, ai_service: AIService):
        self.ai_service = ai_service

    def handle_chat(self, user_id: str, data: ChatRequest):
        return self.ai_service.process_chat(user_id, data)
    
    async def handle_scan_receipt(self, user_id: str, file: UploadFile):
        return await self.ai_service.scan_receipt(user_id, file)