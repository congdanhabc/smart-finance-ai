from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.pagination import QueryParams
from app.core.security import get_current_user
from app.model.user import User

from app.schema.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.repository.category import CategoryRepository
from app.schema.pagination import PaginatedResponse
from app.service.category import CategoryService
from app.controller.category import CategoryController

router = APIRouter()

def get_category_controller(db: Session = Depends(get_db)) -> CategoryController:
    repo = CategoryRepository(db)
    service = CategoryService(repo)
    return CategoryController(service)

# ================= 1. TẠO DANH MỤC MỚI =================
@router.post("/", response_model=CategoryResponse)
def create_category(
    data: CategoryCreate,
    current_user: User = Depends(get_current_user), # Bắt buộc có token
    controller: CategoryController = Depends(get_category_controller)
):
    # Dùng ID THẬT từ token
    return controller.handle_create_category(current_user.id, data)

# ================= 2. LẤY DANH SÁCH DANH MỤC =================
@router.get("/", response_model=PaginatedResponse[CategoryResponse]) # 2. Đổi response_model thành chuẩn phân trang
def get_categories(
    params: QueryParams = Depends(), # 3. Khai báo params ở đây (FastAPI tự lấy từ URL)
    current_user: User = Depends(get_current_user),
    controller: CategoryController = Depends(get_category_controller)
):
    # 4. Truyền thêm params vào hàm handle_get_categories
    return controller.handle_get_categories(current_user.id, params)

# ================= 3. XÓA DANH MỤC =================
@router.delete("/{category_id}")
def delete_category(
    category_id: str,
    current_user: User = Depends(get_current_user),
    controller: CategoryController = Depends(get_category_controller)
):
    return controller.handle_delete_category(current_user.id, category_id)

# ================= 4. CẬP NHẬT DANH MỤC =================
@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: str,
    data: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    controller: CategoryController = Depends(get_category_controller)
):
    return controller.handle_update_category(current_user.id, category_id, data)