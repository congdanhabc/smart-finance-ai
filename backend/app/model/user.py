from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.core.utils import generate_short_id
from typing import List, Optional
from backend.app.model.wallet import Wallet

class User(Base):
    __tablename__ = "user"
    id: Mapped[str] = mapped_column(String(6), primary_key=True, index=True, default=generate_short_id)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    wallets: Mapped[List["Wallet"]] = relationship(back_populates="owner", cascade="all, delete-orphan")