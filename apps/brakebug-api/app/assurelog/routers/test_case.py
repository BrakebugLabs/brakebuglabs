from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from app.database import db
from app.assurelog.models.report import Report
from app.assurelog.models.test_case import TestCase
from app.assurelog.auth.portal_auth import portal_token_required, get_current_user

# test_case_bp = Blueprint('test_case', __name__, url_prefix='/api/test-cases')

router = APIRouter(
    prefix="/test_case",
    tags=["TestCase"]
)

# =========================================================
# Criar novo caso de teste
# =========================================================
@test_case_bp.route('', methods=['POST'])
@portal_token_required
def create_test_case():
    data = request.get_json()

    report_id = data.get('report_id')
    if not report_id:
        return jsonify({'error': 'report_id é obrigatório'}), 400

    report = Report.query.get(report_id)
    if not report:
        return jsonify({'error': 'Relatório não encontrado'}), 404

    test_case = TestCase(
        report_id=report_id,
        tc_number=data.get('tc_number'),
        title=data.get('title'),
        status=data.get('status', 'PASS'),
        scenario_description=data.get('scenario_description'),
        expected_result=data.get('expected_result'),
        actual_result=data.get('actual_result'),
        evidence_files=data.get('evidence_files', [])
    )

    db.session.add(test_case)
    db.session.commit()

    return jsonify(test_case.to_dict()), 201


# =========================================================
# Atualizar caso de teste
# =========================================================
@test_case_bp.route('/<int:test_case_id>', methods=['PUT'])
@portal_token_required
def update_test_case(test_case_id):
    test_case = TestCase.query.get(test_case_id)
    if not test_case:
        return jsonify({'error': 'Caso de teste não encontrado'}), 404

    data = request.get_json()

    test_case.tc_number = data.get('tc_number', test_case.tc_number)
    test_case.title = data.get('title', test_case.title)
    test_case.status = data.get('status', test_case.status)
    test_case.scenario_description = data.get(
        'scenario_description', test_case.scenario_description
    )
    test_case.expected_result = data.get(
        'expected_result', test_case.expected_result
    )
    test_case.actual_result = data.get(
        'actual_result', test_case.actual_result
    )
    test_case.evidence_files = data.get(
        'evidence_files', test_case.evidence_files
    )

    db.session.commit()

    return jsonify(test_case.to_dict())


# =========================================================
# Deletar caso de teste
# =========================================================
@test_case_bp.route('/<int:test_case_id>', methods=['DELETE'])
@portal_token_required
def delete_test_case(test_case_id):
    test_case = TestCase.query.get(test_case_id)
    if not test_case:
        return jsonify({'error': 'Caso de teste não encontrado'}), 404

    db.session.delete(test_case)
    db.session.commit()

    return jsonify({'message': 'Caso de teste deletado com sucesso'}), 200


# =========================================================
# Listar casos de teste por relatório
# (opcional, mas útil para debug / admin)
# =========================================================
@test_case_bp.route('/by-report/<int:report_id>', methods=['GET'])
@portal_token_required
def list_test_cases_by_report(report_id):
    report = Report.query.get(report_id)
    if not report:
        return jsonify({'error': 'Relatório não encontrado'}), 404

    test_cases = TestCase.query.filter_by(report_id=report_id).all()
    return jsonify([tc.to_dict() for tc in test_cases])
