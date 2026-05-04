from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.logger import logger
from app.core.database import engine
from app.model import Base
from app.route.api import api_router

from app.core.config import settings

from fastapi.exceptions import RequestValidationError

# Tự động tạo tất cả các bảng trong DB
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SmartFinance AI",
    description="Intelligent financial management system integrated with AI.",
    version="1.0.0"
)

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 1. Custom lỗi 404 (Endpoint không tồn tại)
@app.exception_handler(404)
async def custom_404_handler(request: Request, exc: Exception):
    # 1. Kiểm tra xem đây có phải là lỗi từ lệnh 'raise HTTPException' không
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=404,
            content={"detail": exc.detail}
        )
    
    # 2. Nếu không phải (do gõ sai URL), thì mới hiện câu thông báo "API không tồn tại"
    logger.warning(f"404 Not Found URL: {request.method} {request.url}")
    return JSONResponse(
        status_code=404,
        content={"detail": "The requested API endpoint does not exist on this server."}
    )

# 2. Custom lỗi 500 (Lỗi server ngầm - Quan trọng nhất)
@app.exception_handler(Exception)
async def custom_500_handler(request: Request, exc: Exception):
    # Ghi lại toàn bộ lỗi chi tiết vào file log để debug
    logger.error(f"Internal Server Error: {request.method} {request.url} - Error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later or contact support."}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"422 Validation Error: {request.method} {request.url} - Body: {exc.body} - Details: {exc.errors()}")
    
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "message": "Invalid request parameters."}
    )

app.include_router(api_router, prefix="/api")
#uvicorn app.main:app --reload