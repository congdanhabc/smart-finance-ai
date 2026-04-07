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
    full_name: str | None = None
    password_hash: str | None = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str 
    email: EmailStr
    full_name: str | None = None

    model_config = ConfigDict(from_attributes=True)