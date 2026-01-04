from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import date as dt_date

# Certifique-se que este import não causa referência circular
from app.assurelog.schemas.test_case import TestCaseSchema

# =========================================================
# BASE
# =========================================================

class ReportBase(BaseModel):
    title: str = Field(
        ..., 
        examples=["Relatório de Testes - Login"]
    )
    # Mudança sugerida: Use Union ou garanta que o tipo esteja claro para o Pydantic
    date: dt_date = Field(
        default_factory=dt_date.today, 
        examples=[dt_date.today()] 
    )
    made_by: Optional[str] = Field(
        default=None, 
        examples=["qa.user"]
    )
    test_environment: Optional[str] = Field(
        default=None, 
        examples=["Homologação"]
    )
    link: Optional[str] = Field(
        default=None, 
        examples=["https://jira.exemplo.com/TEST-123"]
    )
    feature_scenario: Optional[str] = Field(
        default=None, 
        examples=["Feature Login - Cenário de Autenticação"]
    )

# =========================================================
# CREATE
# =========================================================

class ReportCreate(ReportBase):
    pass  # Não precisa redeclarar title: str se já está na Base

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
    created_at: dt_date
    updated_at: Optional[dt_date] = None

    # Se TestCaseSchema causar erro de recursão, use strings para anotação
    test_cases: List["TestCaseSchema"] = [] 
    # test_cases: List["TestCaseSchema"] = Field(default_factory=list) 

    # No Pydantic V2, a forma recomendada é usar ConfigDict
    model_config = ConfigDict(
        from_attributes=True,
        arbitrary_types_allowed=True  # Isso resolve o erro de compatibilidade de tipos desconhecidos
    )