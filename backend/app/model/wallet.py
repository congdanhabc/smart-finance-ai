from sqlalchemy import Boolean, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
import enum
from app.core.database import Base
from app.core.utils import generate_short_id
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from .user import User
    from .transaction import Transaction

class WalletType(str, enum.Enum):
    CASH = "CASH"
    BANK = "BANK"
    E_WALLET = "E_WALLET"
    CREDIT_CARD = "CREDIT_CARD"
    LOAN = "LOAN"

class Wallet(Base):
    __tablename__ = "wallet"

    id: Mapped[str] = mapped_column(String(6), primary_key=True, index=True, default=generate_short_id)
    user_id: Mapped[str] = mapped_column(String(6), ForeignKey("user.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[WalletType] = mapped_column(Enum(WalletType), default=WalletType.CASH)
    balance: Mapped[float] = mapped_column(Float, default=0.0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True) 
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    owner: Mapped["User"] = relationship(back_populates="wallets")
    transactions: Mapped[List["Transaction"]] = relationship(
        back_populates="wallet", 
        foreign_keys="[Transaction.wallet_id]"
    )