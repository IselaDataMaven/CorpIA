from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_admin
from app.db.database import get_db
from app.db.models import AppSetting, User
from app.schemas.settings import SettingsOut, SettingsUpdateRequest

router = APIRouter(prefix="/api/settings", tags=["Configuración"])

DEFAULTS = {
    "company_name": "CorpIA Demo Corp",
    "active_model": "corpia-local",
    "language": "es",
    "theme": "light",
    "timezone": "America/Mexico_City",
    "support_email": "soporte@corpia.demo",
    "logo_url": "",
}


def _all_settings(db: Session) -> dict:
    rows = db.query(AppSetting).all()
    values = {**DEFAULTS, **{r.key: r.value for r in rows}}
    return values


@router.get("", response_model=SettingsOut)
def get_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return SettingsOut(**_all_settings(db))


@router.put("", response_model=SettingsOut)
def update_settings(
    payload: SettingsUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    updates = payload.model_dump(exclude_none=True)
    for key, value in updates.items():
        row = db.query(AppSetting).filter(AppSetting.key == key).first()
        if row:
            row.value = value
        else:
            db.add(AppSetting(key=key, value=value))
    db.commit()
    return SettingsOut(**_all_settings(db))
