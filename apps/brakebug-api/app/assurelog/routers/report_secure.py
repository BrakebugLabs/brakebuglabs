from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import or_ 
from datetime import datetime
from typing import Optional

from app.database import get_db
from app.assurelog.models.report import Report, TestCase
from app.assurelog.models.user import User
from app.services.auth import get_current_user
from app.assurelog.schemas.report import (
    ReportCreate,
    ReportUpdate,
    ReportSchema
)
from app.assurelog.schemas.test_case import (
    TestCaseCreate,
    TestCaseUpdate,
    TestCaseSchema
)

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

# =========================================================
# REPORTS
# =========================================================

# @router.get("/", response_model=List[ReportSchema])
@router.get("/", response_model=dict)
def get_reports(
    search: Optional[str] = Query(None),
    responsible: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    feature: Optional[str] = Query(None),
    environment: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Listar relatórios do usuário atual (ou todos se admin)
    """
    # query = db.query(Report)
    query = (
        db.query(Report)
        .options(selectinload(Report.test_cases))
    )

    # Controle de acesso
    if not current_user.is_admin():
        query = query.filter(Report.user_id == current_user.id)

    # Busca geral
    if search:
        query = query.filter(
            or_(
                Report.title.ilike(f"%{search}%"),
                Report.feature_scenario.ilike(f"%{search}%"),
                Report.test_cases.any(TestCase.title.ilike(f"%{search}%")),
                Report.test_cases.any(TestCase.tc_number.ilike(f"%{search}%")),
                Report.test_cases.any(TestCase.scenario_description.ilike(f"%{search}%")),
            )
        )

    if responsible:
        query = query.filter(Report.made_by.ilike(f"%{responsible}%"))

    if date_from:
        try:
            df = datetime.strptime(date_from, "%Y-%m-%d").date()
            query = query.filter(Report.date >= df)
        except ValueError:
            pass

    if date_to:
        try:
            dt = datetime.strptime(date_to, "%Y-%m-%d").date()
            query = query.filter(Report.date <= dt)
        except ValueError:
            pass

    if status_filter:
        query = query.filter(
            Report.test_cases.any(TestCase.status == status_filter)
        )

    if feature:
        query = query.filter(Report.feature_scenario.ilike(f"%{feature}%"))

    if environment:
        query = query.filter(Report.test_environment.ilike(f"%{environment}%"))

    # Ordenação
    order_column = {
        "title": Report.title,
        "date": Report.date,
        "made_by": Report.made_by,
        "created_at": Report.created_at
    }.get(sort_by, Report.created_at)

    query = query.order_by(
        order_column.asc() if sort_order == "asc" else order_column.desc()
    )

    results = query.all()

    return {
    "reports": results,
    "total": len(results)
    } 


@router.post(
    "/",
    response_model=ReportSchema,
    status_code=status.HTTP_201_CREATED
)
def create_report(
    report_in: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Criar novo relatório
    """
    if not report_in.title:
        raise HTTPException(
            status_code=400,
            detail="Título é obrigatório"
        )

    report = Report(
        title=report_in.title,
        date=report_in.date or datetime.utcnow().date(),
        made_by=report_in.made_by or current_user.username,
        test_environment=report_in.test_environment or "",
        link=report_in.link or "",
        feature_scenario=report_in.feature_scenario or "",
        user_id=current_user.id
    )

    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/{report_id}", response_model=ReportSchema)
def get_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obter relatório específico
    """
    report = db.query(Report).get(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Relatório não encontrado")

    if not current_user.is_admin() and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado")

    return report


@router.put("/{report_id}", response_model=ReportSchema)
def update_report(
    report_id: int,
    report_in: ReportUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Atualizar relatório
    """
    report = db.query(Report).get(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Relatório não encontrado")

    if not current_user.is_admin() and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado")

    for field, value in report_in.dict(exclude_unset=True).items():
        setattr(report, field, value)

    report.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(report)
    return report


# =========================================================
# TEST CASES
# =========================================================

@router.post(
    "/{report_id}/test-cases",
    response_model=TestCaseSchema,
    status_code=status.HTTP_201_CREATED
)
def create_test_case(
    report_id: int,
    test_case_in: TestCaseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Criar novo caso de teste
    """
    report = db.query(Report).get(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Relatório não encontrado")

    if not current_user.is_admin() and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado")

    test_case = TestCase(
        report_id=report_id,
        tc_number=test_case_in.tc_number,
        title=test_case_in.title,
        scenario_description=test_case_in.scenario_description or "",
        expected_result=test_case_in.expected_result,
        actual_result=test_case_in.actual_result,
        status=test_case_in.status or "PASS",
        evidence_files=test_case_in.evidence_files or []
    )

    db.add(test_case)
    db.commit()
    db.refresh(test_case)
    return test_case


@router.put("/test-cases/{test_case_id}", response_model=TestCaseSchema)
def update_test_case(
    test_case_id: int,
    test_case_in: TestCaseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Atualizar caso de teste
    """
    test_case = db.query(TestCase).get(test_case_id)
    if not test_case:
        raise HTTPException(status_code=404, detail="Caso de teste não encontrado")

    report = test_case.report
    if not current_user.is_admin() and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado")

    for field, value in test_case_in.dict(exclude_unset=True).items():
        setattr(test_case, field, value)

    test_case.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(test_case)
    return test_case


@router.delete("/test-cases/{test_case_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_test_case(
    test_case_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletar caso de teste
    """
    test_case = db.query(TestCase).get(test_case_id)
    if not test_case:
        raise HTTPException(status_code=404, detail="Caso de teste não encontrado")

    report = test_case.report
    if not current_user.is_admin() and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado")

    db.delete(test_case)
    db.commit()
