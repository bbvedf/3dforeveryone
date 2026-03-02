from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Cliente
from app.schemas import Token
from app.security import crear_token, verify_password

router = APIRouter(prefix="/auth", tags=["autenticación"])


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Login con email y contraseña. Devuelve JWT Bearer token."""
    cliente = (
        db.query(Cliente)
        .filter(Cliente.email == form_data.username, Cliente.activo == True)
        .first()
    )
    if not cliente or not verify_password(form_data.password, cliente.contraseña_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = crear_token({"sub": cliente.email, "rol": cliente.rol})
    return {"access_token": token, "token_type": "bearer"}
