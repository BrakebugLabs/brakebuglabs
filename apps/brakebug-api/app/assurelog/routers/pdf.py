import os
import uuid
import base64
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from weasyprint import HTML

from app.database import get_db
from app.assurelog.models.report import Report
from app.assurelog.models.test_case import TestCase
from app.assurelog.auth.dependencies import get_current_user
from app.assurelog.models.user import User

router = APIRouter(prefix="/api/secure-reports", tags=["PDF"])

UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))


# =========================================================
# HELPERS
# =========================================================

def get_file_as_base64(file_path: str):
    try:
        with open(file_path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")
    except Exception:
        return None


def generate_html_template(report: Report) -> str:
    """Gera o template HTML para o relatório"""
    
    # CSS para o PDF - Versão refatorada para um visual mais clean e minimalista
    css_styles = """
    <style>
        @page {
            size: A4;
            margin: 2.5cm;
            @top-center {
                content: "AssureLog - Relatório de Evidência";
                font-family: 'Inter', sans-serif;
                font-size: 10px;
                color: #6b7280;
            }
            @bottom-center {
                content: "Página " counter(page) " de " counter(pages);
                font-family: 'Inter', sans-serif;
                font-size: 10px;
                color: #6b7280;
            }
        }
        
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #1f2937;
            margin: 0;
            padding: 0;
            font-size: 11pt;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .header h1 {
            color: #1e40af;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        
        .header .subtitle {
            color: #6b7280;
            font-size: 14px;
            margin-top: 5px;
        }
        
        .report-info {
            padding: 20px;
            margin-bottom: 40px;
            border-left: 5px solid #2563eb;
            background-color: #f8fafc;
        }
        
        .report-info h2 {
            color: #1e40af;
            margin-top: 0;
            font-size: 20px;
            font-weight: 600;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 15px;
        }
        
        .info-item {
            margin-bottom: 0; /* Removido o espaço extra */
        }
        
        .info-label {
            font-weight: 600;
            color: #374151;
            display: block;
            margin-bottom: 4px;
            font-size: 12px;
            text-transform: uppercase;
        }
        
        .info-value {
            color: #4b5563;
            font-size: 14px;
        }
        
        .test-case {
            margin-bottom: 40px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
        }
        
        .test-case-header {
            background-color: #3b82f6; /* Um azul um pouco mais claro */
            color: white;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .test-case-header h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
        }
        
        .test-case-status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
        }
        
        .status-pass {
            background-color: #dcfce7;
            color: #166534;
        }
        
        .status-fail {
            background-color: #fee2e2;
            color: #991b1b;
        }
        
        .status-blocked {
            background-color: #fffbeb;
            color: #92400e;
        }
        
        .test-case-content {
            padding: 20px;
            background-color: #f9fafb;
        }
        
        .scenario-section {
            margin-bottom: 20px;
        }
        
        .scenario-section h4 {
            color: #374151;
            margin-bottom: 10px;
            font-size: 14px;
            font-weight: 600;
        }
        
        .scenario-text {
            border-left: 4px solid #d1d5db; /* Apenas uma linha sutil */
            padding: 8px 12px;
            margin-top: 5px;
            white-space: pre-wrap;
            font-size: 13px;
            color: #4b5563;
            font-style: italic;
        }
        
        .results-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .result-expected {
            border-left-color: #10b981;
        }
        
        .result-actual {
            border-left-color: #3b82f6;
        }
        
        .evidence-section {
            margin-top: 25px;
        }
        
        .evidence-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
            margin-top: 15px;
        }
        
        .evidence-item {
            padding: 10px;
            text-align: left;
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
            border-radius: 6px;
            background-color: #fff;
        }
        
        .evidence-image {
            width: 100%;
            height: auto;
            max-width: 100%;
            border-radius: 4px;
            margin-bottom: 8px;
        }
        
        .evidence-filename {
            font-size: 11px;
            color: #6b7280;
            word-break: break-all;
            font-style: italic;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .footer-info {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
        }
    </style>
    """
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório de Evidência - {report.title}</title>{css_styles}
        # <title>{report.title}</title>{css_styles}
    </head>
    <body>
        <h1>{report.title}</h1>
        <p><strong>Responsável:</strong> {report.made_by}</p>
        <p><strong>Ambiente:</strong> {report.test_environment}</p>
        <hr>
        <div class="header">
            <h1>AssureLog</h1>
            <div class="subtitle">Relatório de Evidência de Testes</div>
        </div>
        
        <div class="report-info">
            <h2>{report.title}</h2>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Data:</span>
                    <div class="info-value">{report.date.strftime('%d/%m/%Y') if report.date else 'N/A'}</div>
                </div>
                <div class="info-item">
                    <span class="info-label">Responsável:</span>
                    <div class="info-value">{report.made_by}</div>
                </div>
                <div class="info-item">
                    <span class="info-label">Ambiente de Teste:</span>
                    <div class="info-value">{report.test_environment or 'N/A'}</div>
                </div>
                <div class="info-item">
                    <span class="info-label">Link:</span>
                    <div class="info-value">{report.link or 'N/A'}</div>
                </div>
            </div>
            {f'<div class="info-item" style="margin-top: 15px;"><span class="info-label">Feature/Cenário:</span><div class="info-value">{report.feature_scenario}</div></div>' if report.feature_scenario else ''}
        </div>
    """
    
    if report.test_cases:
        for i, test_case in enumerate(report.test_cases):
            status_class = {
                'PASS': 'status-pass', 
                'FAIL': 'status-fail', 
                'BLOCKED': 'status-blocked'
            }.get(test_case.status, 'status-pass') 
            
            page_break = 'page-break' if i > 0 else ''
            
            html_content += f"""
            <div class="test-case {page_break}">
                <div class="test-case-header">
                    <h3>{test_case.tc_number}: {test_case.title}</h3>
                    <span class="test-case-status {status_class}">{test_case.status}</span>
                </div>
                <div class="test-case-content">
            """
            
            if test_case.scenario_description:
                html_content += f"""
                <div class="scenario-section">
                    <h4>Descrição do Cenário:</h4>
                    <div class="scenario-text">{test_case.scenario_description}</div>
                </div>
                """

                for test_case in report.test_cases:
                 html += f"""
                <h3>{test_case.tc_number} - {test_case.title}</h3>
                <p><strong>Status:</strong> {test_case.status}</p>
                <p><strong>Resultado Esperado:</strong></p>
                <p>{test_case.expected_result}</p>
                <p><strong>Resultado Obtido:</strong></p>
                <p>{test_case.actual_result}</p>
                """
            
            # html_content += f"""
            # <div class="results-grid">
            #     <div class="scenario-section">
            #         <h4>Resultado Esperado:</h4>
            #         <div class="scenario-text result-expected">{test_case.expected_result}</div>
            #     </div>
            #     <div class="scenario-section">
            #         <h4>Resultado Obtido:</h4>
            #         <div class="scenario-text result-actual">{test_case.actual_result}</div>
            #     </div>
            # </div>
            # """
            
            evidence_files = test_case.evidence_files 
            if evidence_files:
                html_content += """
                <div class="evidence-section">
                    <h4>Arquivos de Evidência:</h4>
                    <div class="evidence-grid">
                """
                
                # for file_info in evidence_files:
                #     # Extraímos o nome do arquivo da URL para construir o caminho local
                #     file_name = file_info.get('url', '').split('/')[-1]
                #     file_path = os.path.join(UPLOAD_FOLDER, file_name)
                    
                #     if file_info.get('type') == 'image' and os.path.exists(file_path):
                #         base64_image = get_file_as_base64(file_path)
                #         if base64_image:
                #             mime_type = file_info.get('mime_type', 'image/png')
                            
                #             html_content += f"""
                #             <div class="evidence-item">
                #                 <img src="data:{mime_type};base64,{base64_image}" 
                #                 alt="{file_info.get('original_name', 'Evidência')}" 
                #                 class="evidence-image">
                #                 <div class="evidence-filename">{file_info.get('original_name', 'Arquivo')}</div>
                #             </div>
                #             """

                if test_case.evidence_files:
                    for file in test_case.evidence_files:
                        filename = file.get("url", "").split("/")[-1]
                        file_path = os.path.join(UPLOAD_FOLDER, filename)

                if os.path.exists(file_path):
                    b64 = get_file_as_base64(file_path)
                    if b64:
                        html += f"""
                        <img src="data:image/png;base64,{b64}" width="500"/>
                        """
                    else:
                        html_content += f"""
                        <div class="evidence-item">
                            <div style="padding: 20px; background-color: #f3f4f6; border-radius: 4px; margin-bottom: 8px;">
                                <div style="font-size: 24px; color: #6b7280;">📄</div>
                            </div>
                            <div class="evidence-filename">{test_case.evidence_files('original_name', 'Arquivo')}</div>
                        </div>
                        """
                
                html_content += """
                    </div>
                </div>
                """
            
            html_content += """
                </div>
            </div>
            """
    else:
        html_content += """
        <div class="test-case">
            <div class="test-case-content">
                <p style="text-align: center; color: #6b7280; font-style: italic;">
                    Nenhum caso de teste foi adicionado a este relatório.
                </p>
            </div>
        </div>
        """
    
    html_content += f"""
         <footer>
            Gerado em {datetime.now().strftime('%d/%m/%Y %H:%M')}
        </footer>
    </body>
    </html>
    """
    
    return html_content

# Rota para exportar um único relatório
@router.get("/{report_id}/export-pdf")
def export_report_pdf(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = (
        db.query(Report)
        .filter(Report.id == report_id)
        .first()
    )

    if not report:
        raise HTTPException(status_code=404, detail="Relatório não encontrado")

    html = generate_html_template(report)

    filename = f"report_{uuid.uuid4().hex}.pdf"
    output_dir = os.path.join(os.getcwd(), "generated_pdfs")
    os.makedirs(output_dir, exist_ok=True)

    file_path = os.path.join(output_dir, filename)

    HTML(string=html).write_pdf(file_path)

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=f"{report.title}.pdf"
    )


@router.get("/export-all-pdf")
def export_all_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin():
        raise HTTPException(status_code=403, detail="Acesso negado")

    reports = db.query(Report).all()

    if not reports:
        raise HTTPException(status_code=404, detail="Nenhum relatório encontrado")

    combined_html = "<html><body>"

    for report in reports:
        combined_html += generate_html_template(report)
        combined_html += "<div style='page-break-before: always'></div>"

    combined_html += "</body></html>"

    filename = f"all_reports_{uuid.uuid4().hex}.pdf"
    file_path = os.path.join(os.getcwd(), "generated_pdfs", filename)

    HTML(string=combined_html).write_pdf(file_path)

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename="assurelog_relatorios.pdf"
    )
