from sqlalchemy import Integer, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.core.database import Base

class OTPCode(Base):
    __tablename__ = "otp_code"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, index=True, nullable=False)
    code: Mapped[str] = mapped_column(String(6), nullable=False)
    otp_type: Mapped[str] = mapped_column(String, nullable=False) # 'REGISTER' hoặc 'RESET_PASSWORD'
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)