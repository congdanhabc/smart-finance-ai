import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from app.core.config import settings
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.model.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


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

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """
    Hàm này tự động giải mã JWT Token để lấy ra user_id.
    Nếu Token hết hạn hoặc sai, nó sẽ thẳng tay ném lỗi 401.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Không thể xác thực thông tin (Token không hợp lệ hoặc đã bị sửa đổi).",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. Giải mã Token bằng SECRET_KEY của server
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        # 2. Lấy user_id từ trong payload (lúc tạo token ta lưu ở trường "sub")
        user_id: str | None = payload.get("sub")
        
        if user_id is None:
            raise credentials_exception
            
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        )
    except jwt.InvalidTokenError:
        raise credentials_exception

    # 3. Lấy thông tin user từ Database để đảm bảo tài khoản chưa bị xóa
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
        
    # 4. Kiểm tra xem tài khoản có đang bị khóa (vô hiệu hóa) không
    if not bool(user.is_active):
        raise HTTPException(status_code=403, detail="Tài khoản của bạn chưa được kích hoạt.")

    # 5. Trả về Object User thật để các hàm bên dưới sử dụng
    return user