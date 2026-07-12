import platform
import time

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.models import User

router = APIRouter(prefix="/api/system", tags=["Sistema"])

_START_TIME = time.time()


@router.get("/info")
def get_system_info(current_user: User = Depends(get_current_user)):
    return {
        "backend_version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "python_version": platform.python_version(),
        "platform": platform.platform(),
        "uptime_seconds": round(time.time() - _START_TIME),
    }
