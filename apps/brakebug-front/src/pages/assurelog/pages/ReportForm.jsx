import { useState, useEffect } from 'react';
import ApiService from '../../../services/assurelog_api';
import '../stylesassure/reportform.css';

const ReportForm = ({ report, onBack, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    made_by: '',
    test_environment: '',
    link: '',
    feature_scenario: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (report) {
      setFormData({
        title: report.title || '',
        date: report.date || new Date().toISOString().split('T')[0],
        made_by: report.made_by || '',
        test_environment: report.test_environment || '',
        link: report.link || '',
        feature_scenario: report.feature_scenario || ''
      });
    }
  }, [report]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.made_by.trim()) {
      setError('Título e responsável são obrigatórios.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const savedReport = report
        ? await ApiService.updateReport(report.id, formData)
        : await ApiService.createReport(formData);

      onSave(savedReport);
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar o relatório.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-form">
      <div className="report-form-header">
        <button className="btn-outline" onClick={onBack}>
          ← Voltar
        </button>
        <h1>{report ? 'Editar Relatório' : 'Novo Relatório'}</h1>
      </div>

      <form className="report-form-card" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="form-grid">
          <div className="form-field">
            <label>Título *</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label>Data</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-field">
          <label>Responsável *</label>
          <input
            name="made_by"
            value={formData.made_by}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label>Ambiente de Teste</label>
          <textarea
            name="test_environment"
            rows="3"
            value={formData.test_environment}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label>Link da Aplicação</label>
          <input
            type="url"
            name="link"
            value={formData.link}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label>Feature / Cenário</label>
          <input
            name="feature_scenario"
            value={formData.feature_scenario}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Relatório'}
          </button>

          <button type="button" className="btn-outline" onClick={onBack}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;
