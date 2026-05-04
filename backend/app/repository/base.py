from typing import Generic, Type, TypeVar, Any, Dict
from pydantic import BaseModel
from app.core.database import Base
import math
import json
from fastapi import HTTPException
from sqlalchemy.orm import Session, Query
from app.core.pagination import QueryParams

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

    def get(self, id: Any) -> ModelType | None:
        return self.db.query(self.model).filter(getattr(self.model, "id") == id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> list[ModelType]:
        return self.db.query(self.model).offset(skip).limit(limit).all()

    # SỬA LẠI HÀM CREATE TRONG BASE REPOSITORY
    def create(self, obj_in: CreateSchemaType | Dict[str, Any], commit: bool = True, **kwargs) -> ModelType:      
        obj_in_data = dict(obj_in) if isinstance(obj_in, dict) else obj_in.model_dump(exclude_unset=True)       
        obj_in_data.update(kwargs) 
        db_obj = self.model(**obj_in_data) 
        
        self.db.add(db_obj)
        if commit:
            self.db.commit()
            self.db.refresh(db_obj)
        else:
            self.db.flush()
            
        return db_obj

    def update(self, db_obj: ModelType, obj_in: UpdateSchemaType | Dict[str, Any], commit: bool = True, **kwargs) -> ModelType:
        obj_data = obj_in if isinstance(obj_in, dict) else obj_in.model_dump(exclude_unset=True)
        
        obj_data.update(kwargs)
        
        for field in obj_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, obj_data[field])
                
        self.db.add(db_obj)
        if commit:
            self.db.commit()
            self.db.refresh(db_obj)
        else:
            self.db.flush()
            
        return db_obj

    def delete(self, id: Any, commit: bool = True) -> ModelType | None:
        obj = self.get(id)
        if obj:
            self.db.delete(obj)
            if commit:
                self.db.commit()
            else:
                self.db.flush()
        return obj

    def commit(self):
        self.db.commit()

    def get_paginated(self, query: Query, params: QueryParams) -> dict:
        
        # ==========================================
        # 1. XỬ LÝ LỌC ĐỘNG (DYNAMIC FILTERING)
        # ==========================================
        if params.filter:
            try:
                # Dịch chuỗi JSON thành Dictionary của Python
                filter_dict = json.loads(params.filter)
                
                # Quét từng key-value trong dict
                for key, value in filter_dict.items():
                    # Chỉ lọc nếu cột đó thực sự tồn tại trong Model (chống lỗi sập app)
                    if hasattr(self.model, key):
                        column = getattr(self.model, key)
                        # Tự động đắp thêm điều kiện AND vào câu SQL
                        query = query.filter(column == value)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Tham số 'filter' phải là định dạng JSON hợp lệ.")

        # ==========================================
        # 2. XỬ LÝ SẮP XẾP (SORTING)
        # ==========================================
        if hasattr(self.model, params.sort_by):
            column = getattr(self.model, params.sort_by)
            if params.sort_order == "desc":
                query = query.order_by(column.desc())
            else:
                query = query.order_by(column.asc())

        # 3. Đếm tổng số lượng (Total)
        total = query.count()

        # 4. Cắt Phân trang (Pagination)
        offset = (params.page - 1) * params.size
        data = query.offset(offset).limit(params.size).all()

        total_pages = math.ceil(total / params.size) if params.size > 0 else 0

        return {
            "data": data,
            "total": total,
            "page": params.page,
            "size": params.size,
            "total_pages": total_pages
        }