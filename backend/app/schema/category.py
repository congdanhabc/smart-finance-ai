from pydantic import BaseModel, ConfigDict
from typing import Optional
from app.model.category import CategoryType

class CategoryCreate(BaseModel):
    name: str
    type: CategoryType
    icon: Optional[str] = "📝"
    color: Optional[str] = "#C8EE44"

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None

class CategoryResponse(CategoryCreate):
    id: str
    model_config = ConfigDict(from_attributes=True)