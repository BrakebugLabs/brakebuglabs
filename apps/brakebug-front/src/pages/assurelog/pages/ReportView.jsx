import { useState, useEffect, useCallback } from 'react';
import apiService from '../../../services/assurelog_api';
import ExportButton from './ExportButton';

import '../stylesassure/repotview.css';

const ReportView = ({ reportId, onBack, onEdit, onNewTestCase, onEditTestCase }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [testCaseToDelete, setTestCaseToDelete] = useState(null);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getReport(reportId);
      setReport(data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    if (reportId) loadReport();
  }, [reportId, loadReport]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('pt-BR');

  const confirmDeleteTestCase = (id) => {
    setTestCaseToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteTestCase = async () => {
    try {
      await apiService.deleteTestCase(testCaseToDelete);
      setShowDeleteConfirm(false);
      setTestCaseToDelete(null);
      loadReport();
    } catch (err) {
      console.error(err);
      setError('Erro ao deletar caso de teste');
    }
  };

  if (loading && !report) {
    return <div className="assure-loading">Carregando relatório...</div>;
  }

  if (error) {
    return <div className="assure-error">{error}</div>;
  }

  if (!report) {
    return <div className="assure-empty">Relatório não encontrado</div>;
  }

  return (
    <div className="assure-report-view">

      <div className="assure-report-top">
        <button className="assure-btn outline" onClick={onBack}>
          ← Voltar
        </button>

        <div className="assure-report-actions">
          <ExportButton reportId={reportId} reportTitle={report.title} />
          <button className="assure-btn primary" onClick={() => onEdit(report)}>
            Editar Relatório
          </button>
        </div>
      </div>

      <h1 className="assure-title">{report.title}</h1>

      <section className="assure-card">
        <h2>Informações do Relatório</h2>
        <p><strong>Data:</strong> {formatDate(report.date)}</p>
        <p><strong>Responsável:</strong> {report.made_by}</p>

        {report.test_environment && (
          <p><strong>Ambiente:</strong> {report.test_environment}</p>
        )}

        {report.link && (
          <p>
            <strong>Link:</strong>{' '}
            <a href={report.link} target="_blank" rel="noopener noreferrer">
              {report.link}
            </a>
          </p>
        )}

        {report.feature_scenario && (
          <p><strong>Feature:</strong> {report.feature_scenario}</p>
        )}
      </section>

      <section className="assure-card">
        <div className="assure-card-header">
          <h2>Casos de Teste</h2>
          <button
            className="assure-btn primary"
            onClick={() => onNewTestCase(reportId)}
          >
            + Novo Caso de Teste
          </button>
        </div>

        {(!report.test_cases || report.test_cases.length === 0) ? (
          <p className="assure-muted">Nenhum caso de teste cadastrado</p>
        ) : (
          <div className="assure-testcase-list">
            {report.test_cases.map(tc => (
              <div key={tc.id} className="assure-testcase">
                <div className="assure-testcase-header">
                  <strong>{tc.tc_number} — {tc.title}</strong>
                  <span className={`assure-status ${tc.status.toLowerCase()}`}>
                    {tc.status}
                  </span>
                </div>

                {tc.scenario_description && (
                  <p><strong>Cenário:</strong> {tc.scenario_description}</p>
                )}

                <p><strong>Esperado:</strong> {tc.expected_result}</p>
                <p><strong>Obtido:</strong> {tc.actual_result}</p>

                <div className="assure-testcase-actions">
                  <button
                    className="assure-btn outline"
                    onClick={() => onEditTestCase(tc)}
                  >
                    Editar
                  </button>
                  <button
                    className="assure-btn danger"
                    onClick={() => confirmDeleteTestCase(tc.id)}
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showDeleteConfirm && (
        <div className="assure-modal-backdrop">
          <div className="assure-modal">
            <h3>Confirmar exclusão</h3>
            <p>Deseja realmente deletar este caso de teste?</p>
            <div className="assure-modal-actions">
              <button
                className="assure-btn outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </button>
              <button
                className="assure-btn danger"
                onClick={handleDeleteTestCase}
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReportView;
