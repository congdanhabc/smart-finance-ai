from fastapi import APIRouter

# Import các file route con
from app.route import ai, auth, category, statistic, wallet, transaction

# Khởi tạo Router Tổng
api_router = APIRouter()

# Gắn các route con vào Router Tổng
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(wallet.router, prefix="/wallet", tags=["Wallet"])
api_router.include_router(transaction.router, prefix="/transaction", tags=["Transactions"])
api_router.include_router(category.router, prefix="/category", tags=["Categories"])
api_router.include_router(statistic.router, prefix="/statistic", tags=["Statistics"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])

