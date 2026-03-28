from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.core.config import settings

# 1. Tạo Engine (Động cơ kết nối DB)
# pool_pre_ping=True giúp kiểm tra kết nối có bị rớt không trước khi gửi query
engine = create_engine(
    settings.DATABASE_URL, 
    pool_pre_ping=True,
)

# 2. Tạo SessionLocal (Nhà máy sản xuất các phiên làm việc với DB)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Base class để các Model kế thừa
class Base(DeclarativeBase):
    pass

# 4. Dependency Injection: Hàm này sẽ cung cấp DB Session cho Controller/Service
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() # Đảm bảo luôn đóng kết nối khi xử lý xong request