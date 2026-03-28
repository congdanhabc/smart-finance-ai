from fastapi import HTTPException
from app.repository.user import UserRepository
from app.schema.user import UserCreate, UserLogin
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.logger import logger

class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def register_user(self, email: str, password: str, full_name: str):
        # 1. Kiểm tra email
        if self.user_repo.get_by_email(email):
            logger.info(f"Registration failed: Email {email} already exists.")
            raise HTTPException(status_code=400, detail="This email address is already registered.")
        
        # 2. Băm mật khẩu và DÙNG HÀM CREATE TỪ BASE REPOSITORY
        hashed_password = get_password_hash(password)
        new_user_data = UserCreate(email=email, password_hash=hashed_password, full_name=full_name)
        
        user = self.user_repo.create(obj_in=new_user_data)

        logger.info(f"New user registered: {email}")
        return {"message": "User account has been created successfully."}

    def login_user(self, login_data: UserLogin):
        user = self.user_repo.get_by_email(login_data.email)

        if not user or not verify_password(login_data.password, user.password_hash):
            logger.warning(f"Login failed for email: {login_data.email}")
            raise HTTPException(
                status_code=401, 
                detail="Invalid credentials. Please check your email or password."
            )
        
        access_token = create_access_token(data={"sub": str(user.id)})
        logger.info(f"User logged in successfully: {user.email}")
        return {"access_token": access_token, "token_type": "bearer", "user_id": user.id}