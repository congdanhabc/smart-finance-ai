from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.pagination import QueryParams
from app.repository.base import BaseRepository
from app.model.category import Category, CategoryType
from app.schema.category import CategoryCreate, CategoryUpdate

class CategoryRepository(BaseRepository[Category, CategoryCreate, CategoryUpdate]):
    def __init__(self, db: Session):
        super().__init__(model=Category, db=db)

    def get_by_user_paginated(self, user_id: str, params: QueryParams):
        query = self.db.query(Category).filter(
            (Category.user_id.is_(None)) | (Category.user_id == user_id)
        )

        if params.search:
            query = query.filter(Category.name.ilike(f"%{params.search}%"))

        return self.get_paginated(query, params)
    
    def count_by_user(self, user_id: str) -> int:
        """Đếm tổng số danh mục mà user đang sở hữu (không tính danh mục hệ thống)"""
        return self.db.query(func.count(self.model.id))\
            .filter(self.model.user_id == user_id).scalar() or 0
    
    def check_duplicate_slug(self, user_id: str, slug: str, cat_type: CategoryType) -> Category | None:
        """Kiểm tra xem user (hoặc hệ thống) đã có danh mục cùng tên và cùng loại chưa"""
        return self.db.query(self.model).filter(
            self.model.slug == slug,
            self.model.type == cat_type,
            (self.model.user_id == user_id) | (self.model.user_id.is_(None))
        ).first()
    
    def get_all_by_user(self, user_id: str):
        """Hàm dùng cho AI"""
        return self.db.query(Category).filter(
            (Category.user_id.is_(None)) | (Category.user_id == user_id)
        ).all()