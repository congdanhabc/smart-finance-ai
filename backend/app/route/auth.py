from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db

from app.repository.user import UserRepository
from app.service.auth import AuthService
from app.controller.auth import AuthController
from app.schema.user import UserLogin
from app.controller.auth import RegisterRequest

router = APIRouter()

def get_auth_controller(db: Session = Depends(get_db)) -> AuthController:
    repo = UserRepository(db)
    service = AuthService(repo)
    return AuthController(service)

@router.post("/register")
def register(data: RegisterRequest, controller: AuthController = Depends(get_auth_controller)):
    return controller.handle_register(data)

@router.post("/login")
def login(data: UserLogin, controller: AuthController = Depends(get_auth_controller)):
    return controller.handle_login(data)