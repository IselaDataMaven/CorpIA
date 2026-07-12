from pydantic import BaseModel


class UserCreateRequest(BaseModel):
    username: str
    password: str
    full_name: str
    role_key: str
    department: str


class UserUpdateRequest(BaseModel):
    full_name: str | None = None
    role_key: str | None = None
    department: str | None = None
    is_active: bool | None = None


class SettingsOut(BaseModel):
    company_name: str
    active_model: str
    language: str
    theme: str
    timezone: str
    support_email: str
    logo_url: str


class SettingsUpdateRequest(BaseModel):
    company_name: str | None = None
    language: str | None = None
    theme: str | None = None
    timezone: str | None = None
    support_email: str | None = None
    logo_url: str | None = None
