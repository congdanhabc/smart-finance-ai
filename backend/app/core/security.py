import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from app.core.config import settings


# Dùng thẳng bcrypt để băm mật khẩu
def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    # bcrypt yêu cầu encode string thành bytes trước khi băm
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password.decode('utf-8')

# Dùng thẳng bcrypt để kiểm tra mật khẩu
def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except ValueError:
        return False

# Hàm tạo Token giữ nguyên
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt