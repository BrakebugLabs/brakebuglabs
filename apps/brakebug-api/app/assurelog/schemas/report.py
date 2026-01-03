from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime

from app.assurelog.schemas.test_case import TestCaseSchema


# =========================================================
# BASE
# =========================================================

class ReportBase(BaseModel):
    title: str = Field(..., example="Relatório de Testes - Login")
    date: Optional[date] = Field(
        default_factory=date.today,
        example="2024-01-15"
    )
    made_by: Optional[str] = Field(
        None,
        example="qa.user"
    )
    test_environment: Optional[str] = Field(
        None,
        example="Homologação"
    )
    link: Optional[str] = Field(
        None,
        example="https://jira.exemplo.com/TEST-123"
    )
    feature_scenario: Optional[str] = Field(
        None,
        example="Feature Login - Cenário de Autenticação"
    )


# =========================================================
# CREATE
# =========================================================

class ReportCreate(ReportBase):
    title: str


# =========================================================
# UPDATE
# =========================================================

class ReportUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[date] = None
    made_by: Optional[str] = None
    test_environment: Optional[str] = None
    link: Optional[str] = None
    feature_scenario: Optional[str] = None


# =========================================================
# RESPONSE
# =========================================================

class ReportSchema(ReportBase):
    id: int
    user_id: int

    created_at: datetime
    updated_at: Optional[datetime]

    # test_cases: List[TestCaseSchema] = []
    test_cases: List[TestCaseSchema] = Field(default_factory=list)

    class Config:
        from_attributes = True
