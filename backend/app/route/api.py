from fastapi import APIRouter

# Import các file route con
from app.route import auth
from app.route import transaction

# Khởi tạo Router Tổng
api_router = APIRouter()

# Gắn các route con vào Router Tổng
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
# api_router.include_router(transaction.router, prefix="/transactions", tags=["Transactions"])

