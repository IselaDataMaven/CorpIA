from datetime import datetime
from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str
    remember_me: bool = False


class UserOut(BaseModel):
    id: str
    username: str
    full_name: str
    role_key: str
    department: str
    avatar_color: str
    is_active: bool = True
    last_login_at: datetime | None = None

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
