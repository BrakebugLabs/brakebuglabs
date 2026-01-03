import { useState } from 'react';
import ApiService from '../../../services/assurelog_api';
import '../stylesassure/exportbutton.css';

const ExportButton = ({ reportId, reportTitle }) => {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    if (!reportId) return;

    setExporting(true);
    setError(null);

    try {
      const blob = await ApiService.exportReportToPDF(reportId);

      const safeTitle =
        reportTitle?.replace(/[^a-zA-Z0-9]/g, '_') || 'relatorio';

      const filename = `${safeTitle}_evidencias.pdf`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Erro ao exportar o relatório em PDF.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="export-button">
      <button
        type="button"
        className="btn-outline"
        onClick={handleExport}
        disabled={exporting}
      >
        {exporting ? 'Gerando PDF...' : 'Exportar PDF'}
      </button>

      {error && <div className="export-error">{error}</div>}
    </div>
  );
};

export default ExportButton;
