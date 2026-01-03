from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime
)
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # ID do usuário vindo do Portal (SSO)
    portal_user_id = Column(
        String(64),
        unique=True,
        nullable=False,
        index=True
    )

    username = Column(String(80), nullable=False)
    email = Column(String(120), nullable=True)

    role = Column(String(20), default="user")
    is_active = Column(Boolean, default=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )
    last_seen_at = Column(DateTime, nullable=True)

    # Relacionamento com relatórios
    reports = relationship(
        "Report",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User {self.username} (portal:{self.portal_user_id})>"

    def is_admin(self) -> bool:
        return self.role == "admin"

    def touch(self):
        """Atualiza último acesso (sem commit automático)"""
        self.last_seen_at = datetime.utcnow()
