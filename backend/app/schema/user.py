from pydantic import BaseModel, EmailStr

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