import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.assurelog.models.user import User
from app.core.config import settings  # JWT_SECRET_KEY

security = HTTPBearer()


# =========================
# Database dependency
# =========================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# Auth dependency
# =========================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Valida JWT do Portal e retorna o usuário autenticado
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=["HS256"]
        )

        portal_user_id = payload.get("user_id")
        if not portal_user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )

        user = db.query(User).filter(
            User.portal_user_id == str(portal_user_id)
        ).first()

        if not user:
            user = User(
                portal_user_id=str(portal_user_id),
                username=payload.get("username", "unknown"),
                email=payload.get("email"),
                role=payload.get("role", "user"),
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        return user

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    except Exception as e:
        print(f"[AUTH ERROR] {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )


# =========================
# Helpers
# =========================

def require_admin(
    user: User = Depends(get_current_user)
):
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user


def can_access_resource(
    resource_user_id: int,
    user: User = Depends(get_current_user)
) -> bool:
    return user.role == "admin" or user.id == resource_user_id
