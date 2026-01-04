from datetime import datetime
from pydantic import BaseModel


class UserBase(BaseModel):
    portal_user_id: str
    username: str
    email: str | None = None
    role: str = "user"
    is_active: bool = True


class UserCreate(UserBase):
    pass


class UserRead(UserBase):
    id: int
    created_at: datetime
    last_seen_at: datetime | None = None

    class Config:
        from_attributes = True


class UserMe(BaseModel):
    """
    Schema específico para /auth/me
    (evita expor campos desnecessários)
    """
    id: int
    portal_user_id: str
    username: str
    role: str

    class Config:
        from_attributes = True
