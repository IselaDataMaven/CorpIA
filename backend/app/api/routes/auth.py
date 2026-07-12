from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import create_access_token
from app.db.database import get_db
from app.db.models import User
from app.schemas.auth import LoginRequest, LoginResponse, UserOut
from app.services.auth_service import authenticate_user

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Autentica un usuario y devuelve un token JWT.

    Usuarios demo: admin.corpia / rrhh.corpia / marketing.corpia / ti.corpia /
    finanzas.corpia (ver README para las contraseñas de cada uno).
    """
    user = authenticate_user(db, payload.username, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
        )
    token = create_access_token({"sub": user.id, "role": user.role_key})
    return LoginResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    # El token es stateless (JWT); "cerrar sesión" es responsabilidad del
    # cliente al descartar el token. Se deja el endpoint por completitud de
    # la API y para permitir, en el futuro, una lista de revocación.
    return {"detail": "Sesión cerrada correctamente"}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
