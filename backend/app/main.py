from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.logger import logger
from app.core.database import engine
from app.model import Base
from app.route.api import api_router

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
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 1. Custom lỗi 404 (Endpoint không tồn tại)
@app.exception_handler(404)
async def custom_404_handler(request: Request, __):
    logger.warning(f"404 Not Found: {request.method} {request.url}")
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

app.include_router(api_router, prefix="/api")