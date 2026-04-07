from sqlalchemy import String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
import enum
from app.core.database import Base
from app.core.utils import generate_short_id
from typing import Optional

from backend.app.model.category import Category
from backend.app.model.wallet import Wallet

class TransactionType(str, enum.Enum):
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"
    TRANSFER = "TRANSFER" 

class Transaction(Base):
    __tablename__ = "transaction"

    id: Mapped[str] = mapped_column(String(6), primary_key=True, index=True, default=generate_short_id)
    user_id: Mapped[str] = mapped_column(String(6), ForeignKey("user.id", ondelete="CASCADE"))
    
    wallet_id: Mapped[str] = mapped_column(String(6), ForeignKey("wallet.id", ondelete="CASCADE"))
    to_wallet_id: Mapped[Optional[str]] = mapped_column(String(6), ForeignKey("wallet.id", ondelete="CASCADE"))
    category_id: Mapped[Optional[str]] = mapped_column(String(6), ForeignKey("category.id", ondelete="SET NULL"))
    
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    type: Mapped[TransactionType] = mapped_column(Enum(TransactionType))
    description: Mapped[Optional[str]] = mapped_column(String)
    
    transaction_date: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    wallet: Mapped["Wallet"] = relationship(foreign_keys=[wallet_id], back_populates="transactions")
    wallet_to: Mapped[Optional["Wallet"]] = relationship(foreign_keys=[to_wallet_id])
    category: Mapped[Optional["Category"]] = relationship(back_populates="transactions")