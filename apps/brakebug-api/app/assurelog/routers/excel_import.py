import os
import tempfile
from typing import List

import pandas as pd
from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException,
    status,
    Form
)
from sqlalchemy.orm import Session

from app.database import get_db
from app.assurelog.models.report import Report
from app.assurelog.models.test_case import TestCase
from app.assurelog.models.user import User
from app.services.auth import get_current_user

router = APIRouter(
    prefix="/api/excel",
    tags=["Excel Import"]
)

REQUIRED_COLUMNS = [
    "ID",
    "Caso de Teste",
    "Passo-a-passo",
    "Resultado Esperado"
]


# =========================================================
# IMPORTAÇÃO
# =========================================================

@router.post("/import")
def import_excel(
    file: UploadFile = File(...),
    report_title: str = Form(""),
    test_environment: str = Form(""),
    feature_scenario: str = Form(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.lower().endswith((".xlsx", ".xls")):
        raise HTTPException(
            status_code=400,
            detail="Arquivo deve ser Excel (.xlsx ou .xls)"
        )

    with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as temp_file:
        temp_path = temp_file.name
        temp_file.write(file.file.read())

    try:
        df = pd.read_excel(temp_path)

        missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
        if missing:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Colunas obrigatórias ausentes",
                    "missing_columns": missing,
                    "found_columns": df.columns.tolist()
                }
            )

        if not report_title:
            report_title = f"Importação {file.filename}"

        report = Report(
            title=report_title,
            test_environment=test_environment,
            feature_scenario=feature_scenario,
            made_by=current_user.username,
            user_id=current_user.id
        )

        db.add(report)
        db.flush()

        imported = 0
        errors = []

        status_map = {
            "passou": "PASS",
            "pass": "PASS",
            "falhou": "FAIL",
            "fail": "FAIL",
            "bloqueado": "BLOCKED",
            "blocked": "BLOCKED",
            "pendente": "PENDING",
            "pending": "PENDING",
        }

        for index, row in df.iterrows():
            try:
                test_case = TestCase(
                    report_id=report.id,
                    tc_number=str(row["ID"]).strip(),
                    title=str(row["Caso de Teste"]).strip(),
                    scenario_description=str(row["Passo-a-passo"]).strip(),
                    expected_result=str(row["Resultado Esperado"]).strip(),
                    actual_result=str(row.get("Resultado Obtido", "")).strip(),
                    status=status_map.get(
                        str(row.get("Estado", "Pendente")).lower(),
                        "PENDING"
                    ),
                    evidence_files=[]
                )

                db.add(test_case)
                imported += 1

            except Exception as e:
                errors.append(f"Linha {index + 2}: {str(e)}")

        db.commit()

        return {
            "message": "Importação concluída",
            "report_id": report.id,
            "imported_count": imported,
            "total_rows": len(df),
            "errors": errors
        }

    finally:
        os.remove(temp_path)


# =========================================================
# TEMPLATE INFO
# =========================================================

@router.get("/template")
def excel_template_info():
    return {
        "required_columns": [
            {"name": "ID", "description": "Identificador do caso"},
            {"name": "Caso de Teste", "description": "Título do teste"},
            {"name": "Passo-a-passo", "description": "Passos do teste"},
            {"name": "Resultado Esperado", "description": "Resultado esperado"},
        ],
        "optional_columns": [
            {"name": "Resultado Obtido"},
            {"name": "Estado"},
            {"name": "Comentários"},
        ],
        "status_values": ["PASS", "FAIL", "BLOCKED", "PENDING"]
    }


# =========================================================
# VALIDAÇÃO (PREVIEW)
# =========================================================

@router.post("/validate")
def validate_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.lower().endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Arquivo inválido")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as temp_file:
        temp_path = temp_file.name
        temp_file.write(file.file.read())

    try:
        df = pd.read_excel(temp_path)

        missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]

        valid_rows = 0
        invalid_rows = []

        for index, row in df.iterrows():
            if all(str(row.get(c, "")).strip() for c in REQUIRED_COLUMNS):
                valid_rows += 1
            else:
                invalid_rows.append(index + 2)

        preview = (
            df.head(5)
            .fillna("")
            .to_dict(orient="records")
            if not df.empty else []
        )

        return {
            "valid": not missing and valid_rows > 0,
            "total_rows": len(df),
            "valid_rows": valid_rows,
            "invalid_rows": invalid_rows,
            "missing_columns": missing,
            "found_columns": df.columns.tolist(),
            "preview_data": preview
        }

    finally:
        os.remove(temp_path)
