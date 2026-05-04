from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class ResendOTPRequest(BaseModel):
    email: EmailStr

class VerifyRegistrationRequest(BaseModel):
    email: EmailStr
    code: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str

class UserCreate(BaseModel):
    email: EmailStr
    password_hash: str
    full_name: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    gemini_api_key: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str 
    email: EmailStr
    full_name: str | None = None
    gemini_api_key: str | None = None

    model_config = ConfigDict(from_attributes=True)

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
    confirm_password: str