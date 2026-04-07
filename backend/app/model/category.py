from sqlalchemy import String, Integer, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from app.core.database import Base
from app.core.utils import generate_short_id 
from typing import List, Optional

from backend.app.model.transaction import Transaction

class CategoryType(str, enum.Enum):
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"

class Category(Base):
    __tablename__ = "category"

    id: Mapped[str] = mapped_column(String(6), primary_key=True, index=True, default=generate_short_id)
    user_id: Mapped[Optional[str]] = mapped_column(String(6), ForeignKey("user.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String, nullable=False) 
    type: Mapped[CategoryType] = mapped_column(Enum(CategoryType))
    icon: Mapped[Optional[str]] = mapped_column(String) 
    color: Mapped[Optional[str]] = mapped_column(String) 

    # Relationships
    transactions: Mapped[List["Transaction"]] = relationship(back_populates="category")