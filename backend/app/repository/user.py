from sqlalchemy.orm import Session
from app.repository.base import BaseRepository
from app.model.user import User
from app.schema.user import UserCreate, UserUpdate

class UserRepository(BaseRepository[User, UserCreate, UserUpdate]):
    def __init__(self, db: Session):
        super().__init__(model=User, db=db)

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()