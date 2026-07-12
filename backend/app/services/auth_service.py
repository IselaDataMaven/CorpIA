from datetime import datetime

from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.db.models import User


def authenticate_user(db: Session, username: str, password: str) -> User | None:
    user = db.query(User).filter(User.username == username).first()
    if not user or not user.is_active or not verify_password(password, user.hashed_password):
        return None
    user.last_login_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user
