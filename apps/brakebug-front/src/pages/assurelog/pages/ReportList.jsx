import { useState, useEffect, useCallback, useMemo } from 'react';
import apiService from '../../../services/assurelog_api';
import ExportButton from './ExportButton';
import SearchFilters from './SearchFilters';
import QuickSearch from './QuickSearch';

import '../stylesassure/reportlist.css';

const ReportList = ({ onCreateNew, onViewReport, onEditReport, defaultSearchMode = false }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [searchResults, setSearchResults] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = useCallback(async (searchFilters = {}) => {
    try {
      if (initialLoad) setLoading(true);

      const data = await apiService.getReports(searchFilters);

      if (data?.reports) {
        setReports(data.reports);
        setSearchResults(data);
      } else {
        setReports([]);
        setSearchResults(null);
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [initialLoad]);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    loadReports(newFilters);
  }, [loadReports]);

  const handleDeleteReport = useCallback(async (reportId) => {
    if (!window.confirm('Deseja realmente deletar este relatório?')) return;

    try {
      await apiService.deleteReport(reportId);
      loadReports(filters);
    } catch (err) {
      console.error(err);
      setError('Erro ao deletar relatório');
    }
  }, [filters, loadReports]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(v => v);
  }, [filters]);

  if (loading && initialLoad) {
    return <div className="assure-loading">Carregando relatórios...</div>;
  }

  if (error) {
    return (
      <div className="assure-error">
        <p>{error}</p>
        <button className="assure-btn outline" onClick={() => loadReports(filters)}>
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="assure-report-list">

      <div className="assure-report-header">
        <div>
          <h1>AssureLog — Relatórios</h1>
          {searchResults && hasActiveFilters && (
            <p className="assure-muted">
              {searchResults.total} resultado(s) encontrado(s)
            </p>
          )}
        </div>

        <div className="assure-actions">
          <QuickSearch onSelectResult={(r) => onViewReport(r.id)} />
          <button className="assure-btn primary" onClick={onCreateNew}>
            Novo Relatório
          </button>
        </div>
      </div>

      <SearchFilters onFiltersChange={handleFiltersChange} initialFilters={filters} />

      {loading && !initialLoad && (
        <div className="assure-loading-small">
          Atualizando resultados...
        </div>
      )}

      {reports.length === 0 ? (
        <div className="assure-empty">
          <p>
            {hasActiveFilters
              ? 'Nenhum resultado encontrado com os filtros atuais.'
              : 'Nenhum relatório cadastrado ainda.'}
          </p>
          <button className="assure-btn primary" onClick={onCreateNew}>
            Criar primeiro relatório
          </button>
        </div>
      ) : (
        <div className="assure-report-grid">
          {reports.map(report => (
            <div key={report.id} className="assure-card">

              <div className="assure-card-header">
                <h2>{report.title}</h2>
                <span className="assure-badge">
                  {report.test_cases_count} testes
                </span>
              </div>

              <div className="assure-card-body">
                <p><strong>Data:</strong> {report.date}</p>
                <p><strong>Responsável:</strong> {report.made_by}</p>
                {report.feature_scenario && (
                  <p><strong>Feature:</strong> {report.feature_scenario}</p>
                )}
              </div>

              <div className="assure-card-actions">
                <button className="assure-btn outline" onClick={() => onViewReport(report.id)}>
                  Ver
                </button>
                <button className="assure-btn outline" onClick={() => onEditReport(report)}>
                  Editar
                </button>
                <button
                  className="assure-btn danger"
                  onClick={() => handleDeleteReport(report.id)}
                >
                  Deletar
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportList;
