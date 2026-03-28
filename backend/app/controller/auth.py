from app.service.auth import AuthService
from app.schema.user import UserLogin
from pydantic import BaseModel, EmailStr

# Schema trung gian nhận request từ Route
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class AuthController:
    def __init__(self, auth_service: AuthService):
        self.auth_service = auth_service

    def handle_register(self, data: RegisterRequest):
        return self.auth_service.register_user(data.email, data.password, data.full_name)

    def handle_login(self, data: UserLogin):
        return self.auth_service.login_user(data)