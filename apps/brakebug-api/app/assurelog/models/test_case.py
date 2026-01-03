from datetime import datetime
from sqlalchemy import ( Column, Integer, String, Text, DateTime, ForeignKey)
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(Integer, primary_key=True, index=True)

    report_id = Column( Integer, ForeignKey("reports.id", ondelete="CASCADE"), nullable=False)

    tc_number = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)

    scenario_description = Column(Text, default="")
    expected_result = Column(Text, nullable=False)
    actual_result = Column(Text, nullable=False)

    status = Column(String(20), default="PASS")

    # Lista de evidências (nomes ou URLs)
    evidence_files = Column(JSON, nullable=False, default=list)

    # created_at = Column( DateTime, default=datetime.utcnow)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # updated_at = Column( DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relacionamento
    report = relationship("Report", back_populates="test_cases")
