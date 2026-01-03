from datetime import date, datetime
from sqlalchemy import ( Column, Integer, String, Date, DateTime, ForeignKey, Text)
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    date = Column(Date, nullable=False, default=date.today)
    made_by = Column(String(100), nullable=False)

    test_environment = Column(String(100), default="")
    link = Column(String(255), default="")
    feature_scenario = Column(String(255), default="")

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # created_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    test_cases = relationship(
        "TestCase",
        back_populates="report",
        cascade="all, delete-orphan"
    )

