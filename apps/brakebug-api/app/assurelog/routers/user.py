from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserRead, UserMe
from app.core.security import get_current_user

router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


@router.get("/me", response_model=UserMe)
def read_current_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retorna o usuário autenticado (via JWT)
    """
    current_user.touch()
    db.commit()

    return current_user


@router.get("/{user_id}", response_model=UserRead)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Admin pode acessar qualquer usuário
    Usuário comum só acessa a si mesmo
    """
    if not current_user.is_admin() and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado"
        )

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )

    return user
