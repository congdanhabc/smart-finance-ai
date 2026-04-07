from typing import Generic, Type, TypeVar
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import Base

# Khai báo các kiểu dữ liệu chung (Generic Types)
ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class BaseRepository(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType], db: Session):
        """
        model: Class Model của SQLAlchemy (VD: User, Transaction)
        db: Session kết nối CSDL
        """
        self.model = model
        self.db = db

    def get(self, id: str) -> ModelType | None:
        return self.db.query(self.model).filter(getattr(self.model, "id") == id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> list[ModelType]:
        return self.db.query(self.model).offset(skip).limit(limit).all()

    def create(self, obj_in: CreateSchemaType) -> ModelType:
        # Chuyển đổi Pydantic Schema thành Dictionary, bỏ qua các trường None nếu cần
        obj_in_data = obj_in.model_dump(exclude_unset=True)
        db_obj = self.model(**obj_in_data) # Khởi tạo đối tượng Model
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, db_obj: ModelType, obj_in: UpdateSchemaType | dict) -> ModelType:
        obj_data = obj_in if isinstance(obj_in, dict) else obj_in.model_dump(exclude_unset=True)
        for field in obj_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, obj_data[field])
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, id: str) -> ModelType | None:
        obj = self.get(id)
        if obj:
            self.db.delete(obj)
            self.db.commit()
        return obj