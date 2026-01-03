import { useState, useEffect } from 'react';
import FileUpload from './FileUpload';

import '../stylesassure/testcaseform.css';

const TestCaseForm = ({ testCase, onSave, onBack, onImportExcel }) => {
  const [formData, setFormData] = useState({
    tc_number: '',
    title: '',
    status: 'Passou',
    scenario_description: '',
    expected_result: '',
    actual_result: '',
    evidence_files: [],
  });

  useEffect(() => {
    let mounted = true;

    const carregarArquivos = async () => {
      if (testCase && mounted) {
        setFormData({
          tc_number: testCase.tc_number || '',
          title: testCase.title || '',
          status:
            testCase.status === 'PASS'
              ? 'Passou'
              : testCase.status === 'FAIL'
              ? 'Falhou'
              : 'Bloqueado',
          scenario_description: testCase.scenario_description || '',
          expected_result: testCase.expected_result || '',
          actual_result: testCase.actual_result || '',
          evidence_files: testCase.evidence_files || [],
        });
      }
    };

    carregarArquivos();
    return () => (mounted = false);
  }, [testCase]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilesUploaded = (files) => {
    setFormData((prev) => ({
      ...prev,
      evidence_files: [...prev.evidence_files, ...files],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const statusMap = {
      Passou: 'PASS',
      Falhou: 'FAIL',
      Bloqueado: 'BLOCKED',
    };

    onSave({
      ...formData,
      status: statusMap[formData.status] || 'PASS',
    });
  };

  return (
    <div className="assure-testcase-form">
      <div className="assure-form-header">
        <button className="assure-btn outline" onClick={onBack}>
          ← Voltar
        </button>
        <h1>
          {testCase ? 'Editar Caso de Teste' : 'Novo Caso de Teste'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="assure-form-card">
        <div className="assure-form-grid">
          <div>
            <label>Número do TC *</label>
            <input
              name="tc_number"
              value={formData.tc_number}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Status</label>
            <div className="assure-status-group">
              {['Passou', 'Falhou', 'Bloqueado'].map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`assure-status-btn ${
                    formData.status === status ? 'active' : ''
                  }`}
                  onClick={() =>
                    setFormData((p) => ({ ...p, status }))
                  }
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <label>Título *</label>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <label>Descrição do Cenário</label>
        <textarea
          name="scenario_description"
          rows={4}
          value={formData.scenario_description}
          onChange={handleChange}
        />

        <div className="assure-form-grid">
          <div>
            <label>Resultado Esperado *</label>
            <textarea
              name="expected_result"
              rows={3}
              value={formData.expected_result}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Resultado Obtido *</label>
            <textarea
              name="actual_result"
              rows={3}
              value={formData.actual_result}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <label>Arquivos de Evidência</label>
        <FileUpload
          onFilesUploaded={handleFilesUploaded}
          existingFiles={formData.evidence_files}
        />

        <div className="assure-import-box">
          <p>Importar múltiplos casos de teste via Excel</p>
          <button
            type="button"
            className="assure-btn secondary"
            onClick={onImportExcel}
          >
            Importar do Excel
          </button>
        </div>

        <div className="assure-form-actions">
          <button
            type="button"
            className="assure-btn outline"
            onClick={onBack}
          >
            Cancelar
          </button>
          <button type="submit" className="assure-btn primary">
            Salvar Caso de Teste
          </button>
        </div>
      </form>
    </div>
  );
};

export default TestCaseForm;
