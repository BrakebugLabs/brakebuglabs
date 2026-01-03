from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

# =========================================================
# BASE
# =========================================================

class TestCaseBase(BaseModel):
    tc_number: str = Field(..., example="TC-001")
    title: str = Field(..., example="Login com usuário válido")
    scenario_description: Optional[str] = Field(
        None,
        example="Usuário acessa a tela de login e insere credenciais válidas"
    )
    expected_result: str = Field(..., example="Usuário autenticado com sucesso")
    actual_result: str = Field(..., example="Login realizado corretamente")
    status: Optional[str] = Field(
        "PASS",
        example="PASS",
        description="Status do caso de teste (PASS | FAIL | BLOCKED)"
    )
    evidence_files: Optional[List[str]] = Field(
        default_factory=list,
        example=["evidences/login_ok.png", "evidences/log_123.txt"]
    )


# =========================================================
# CREATE
# =========================================================

class TestCaseCreate(TestCaseBase):
    pass


# =========================================================
# UPDATE
# =========================================================

class TestCaseUpdate(BaseModel):
    tc_number: Optional[str] = None
    title: Optional[str] = None
    scenario_description: Optional[str] = None
    expected_result: Optional[str] = None
    actual_result: Optional[str] = None
    status: Optional[str] = None
    evidence_files: Optional[List[str]] = None


# =========================================================
# RESPONSE
# =========================================================

class TestCaseSchema(TestCaseBase):
    id: int
    report_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# =========================================================
# ENUM
# =========================================================


# class TestCaseStatus(str, Enum):
#     PASS = "PASS"
#     FAIL = "FAIL"
#     BLOCKED = "BLOCKED"

# status: TestCaseStatus = TestCaseStatus.PASS
