from sqlalchemy.orm import Session
from app.repository.base import BaseRepository
from app.model.category import Category
from app.schema.category import CategoryCreate, CategoryUpdate

class CategoryRepository(BaseRepository[Category, CategoryCreate, CategoryUpdate]):
    def __init__(self, db: Session):
        super().__init__(model=Category, db=db)

    def get_by_user(self, user_id: str):
        # Lấy danh mục hệ thống (user_id IS NULL) + danh mục do user tự tạo
        return self.db.query(Category).filter(
            (Category.user_id.is_(None)) | (Category.user_id == user_id)
        ).all()