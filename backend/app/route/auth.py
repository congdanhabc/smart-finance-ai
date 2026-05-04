from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db

from app.core.security import get_current_user
from app.model.user import User
from app.repository.user import UserRepository
from app.service.auth import AuthService
from app.controller.auth import AuthController
from app.schema.user import ChangePasswordRequest, ForgotPasswordRequest, ResendOTPRequest, ResetPasswordRequest, UserLogin, UserResponse, UserUpdate, VerifyRegistrationRequest
from app.controller.auth import RegisterRequest

router = APIRouter()

def get_auth_controller(db: Session = Depends(get_db)) -> AuthController:
    repo = UserRepository(db)
    service = AuthService(repo)
    return AuthController(service)

@router.post("/register")
def register(data: RegisterRequest, controller: AuthController = Depends(get_auth_controller)):
    return controller.handle_register(data)

@router.post("/resend_otp")
def resend_otp(data: ResendOTPRequest, controller: AuthController = Depends(get_auth_controller)):
    return controller.handle_resend_otp(data)

@router.post("/verify_registration")
def verify_registration(data: VerifyRegistrationRequest, controller: AuthController = Depends(get_auth_controller)):
    return controller.handle_verify_registration(data)

@router.post("/login")
def login(data: UserLogin, controller: AuthController = Depends(get_auth_controller)):
    return controller.handle_login(data)

@router.post("/forgot_password")
def forgot_password(data: ForgotPasswordRequest, controller: AuthController = Depends(get_auth_controller)):
    return controller.handle_forgot_password(data)

@router.post("/reset_password")
def reset_password(data: ResetPasswordRequest, controller: AuthController = Depends(get_auth_controller)):
    return controller.handle_reset_password(data)

@router.put("/me", response_model=UserResponse)
def update_profile(
    data: UserUpdate, 
    current_user: User = Depends(get_current_user),
    controller: AuthController = Depends(get_auth_controller)
):
    return controller.handle_update_profile(current_user.id, data)

@router.put("/change-password")
def change_password(
    data: ChangePasswordRequest, 
    current_user: User = Depends(get_current_user),
    controller: AuthController = Depends(get_auth_controller)
):
    return controller.handle_change_password(current_user.id, data)