import { useEffect, useState, useCallback, useMemo } from 'react';
import apiService from './services/assurelog_api';
import Header from './pages/assurelog/pages/Header';
import ReportListWithSearch from './pages/assurelog/pages/ReportList';
import ReportForm from './pages/assurelog/pages/ReportForm';
import ReportView from './pages/assurelog/pages/ReportView';
import TestCaseForm from './pages/assurelog/pages/TestCaseForm';
// import UserProfile from './pages/assurelog/pages/UserProfile';
// import ExcelImport from './pages/assurelog/pages/ExcelImport';

import './styles/themesassure.css';
// import './stylesassure/reportlist';
// import './stylesassure/components';
// import './stylesassure/reportbug';
// import './stylesassure/footer';

// App autenticado (usuário logado)
function AuthenticatedApp() {

  const [currentView, setCurrentView] = useState('profile');
  const [selectedReport, setSelectedReport] = useState(null);
  // reportView controla a sub-visualização dentro de 'reports'
  const [reportView, setReportView] = useState('list'); // 'list', 'form', 'view', 'test_case_form'
  const [selectedTestCase, setSelectedTestCase] = useState(null); // Estado para o caso de teste sendo editado
  // const [showExcelImport, setShowExcelImport] = useState(false);

  const [user, setUser] = useState(null);
  useEffect(() => {
    apiService.request('/auth/me')
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const handleCreateNew = useCallback(() => {
    setCurrentView('reports');
    setSelectedReport(null);
    setReportView('form');
  }, []);

  const handleEditReport = useCallback((report) => {
    setSelectedReport(report);
    setReportView('form');
  }, []);

  const handleViewReport = useCallback((reportId) => {
    setSelectedReport({ id: reportId }); // Apenas o ID é suficiente para carregar
    setReportView('view');
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedReport(null);
    setSelectedTestCase(null); // Limpa caso de teste ao voltar para a lista
    setReportView('list');
  }, []);

  // Callback para quando um relatório é salvo (do ReportForm)
  const handleReportSaved = useCallback((savedReportResponse) => {
    const actualReport = savedReportResponse.report || savedReportResponse;
    setSelectedReport(actualReport);
    setReportView('view'); // Volta para a visualização do relatório salvo
  }, []);

  // --- Funções para gerenciar a visualização do TestCaseForm ---
  const handleNewTestCase = useCallback((reportId) => {
    setSelectedReport({ id: reportId }); // Define o relatório ao qual o caso de teste pertence
    setSelectedTestCase(null); // Garante que é um novo caso de teste
    setReportView('test_case_form'); // Muda a visualização para o formulário de caso de teste
  }, []);

  const handleEditTestCase = useCallback((testCase) => {
    setSelectedReport({ id: testCase.report_id }); // Garante o reportId para o formulário
    setSelectedTestCase(testCase); // Define o caso de teste para edição
    setReportView('test_case_form'); // Muda a visualização para o formulário de caso de teste
  }, []);

  // Callback para quando um caso de teste é salvo ou o formulário é cancelado
  const handleTestCaseSavedOrCanceled = useCallback(async () => {
    // Após salvar/cancelar, volta para a visualização do relatório atual
    if (selectedReport?.id) {
      // Opcional: Recarregar o relatório para garantir dados atualizados no ReportView
      setReportView('view');
    } else {
      // Se não houver relatório selecionado, volta para a lista
      setReportView('list');
    }
    setSelectedTestCase(null); // Limpa o caso de teste selecionado
  }, [selectedReport]);

  // --- Lógica de Importação de Excel ---
  // const handleExcelImport = useCallback(() => {
  //   setShowExcelImport(true);
  // }, []);

  // const handleExcelImportSuccess = useCallback((reportId) => {
  //   setShowExcelImport(false);
  //   if (reportId) {
  //     handleViewReport(reportId);
  //   }
  // }, [handleViewReport]);

  // const handleCloseExcelImport = useCallback(() => {
  //   setShowExcelImport(false);
  // }, []);

  // --- Lógica de Mudança de Visualização Principal (Header) ---
  const handleViewChange = useCallback((view) => {
    setCurrentView(view);
    // Resetar estados de visualização de relatório e caso de teste ao mudar a view principal
    setReportView('list');
    setSelectedReport(null);
    setSelectedTestCase(null);
  }, []);

  const goToReportForm = useCallback(() => {
    setCurrentView('reports');
    setSelectedReport(null);
    setSelectedTestCase(null);
    setReportView('form');
  }, []);

  // --- RENDERIZAÇÃO CONDICIONAL ---
  const renderContent = useMemo(() => {
    switch (currentView) {
      case 'reports':
        switch (reportView) {
          case 'profile':
            return (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Bem-vindo ao AssureLog
                </h2>

                <p className="text-gray-600 mb-6">
                  Olá, <strong>{user?.username}</strong> 👋
                  Use o menu acima para criar ou consultar seus relatórios de testes.
                </p>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => handleViewChange('reports')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Ver Relatórios
                  </button>

                  <button
                    onClick={() => {
                      handleViewChange('reports');
                      setReportView('form');
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Criar Novo Relatório
                  </button>
                </div>
              </div>
            );


          case 'list':
            return (
              <ReportListWithSearch
                onCreateNew={handleCreateNew}
                onViewReport={handleViewReport}
                onEditReport={handleEditReport}
              />
            );
          case 'form':
            return (
              <ReportForm
                report={selectedReport}
                onBack={handleBackToList}
                onSave={handleReportSaved}
              />
            );
          case 'view':
            return selectedReport && selectedReport.id ? (
              <ReportView
                reportId={selectedReport.id}
                onBack={handleBackToList}
                onEdit={handleEditReport}
                onNewTestCase={handleNewTestCase} // Passa a função para criar novo caso de teste
                onEditTestCase={handleEditTestCase} // Passa a função para editar caso de teste
              />
            ) : null;
          case 'test_case_form': // NOVO CASO PARA RENDERIZAR O FORMULÁRIO DE CASO DE TESTE
            return (
              <TestCaseForm
                reportId={selectedReport?.id}
                testCase={selectedTestCase}
                onBack={handleTestCaseSavedOrCanceled} // Volta para a visualização do relatório
                onSave={handleTestCaseSavedOrCanceled} // Salva e volta para a visualização do relatório
              // onImportExcel={handleExcelImport} // Passa a função de importação do Excel
              />
            );
          default:
            return null;
        }

      case 'search':
        return (
          <ReportListWithSearch
            onCreateNew={handleCreateNew}
            onViewReport={handleViewReport}
            onEditReport={handleEditReport}
            defaultSearchMode={true}
          />
        );

      // case 'admin':
      //   return user?.role === 'admin'
      //     ? <AdminPanel />
      //     : <div className="text-center py-12 text-red-600">
      //       Acesso restrito a administradores
      //     </div>;

      // case 'profile':
        // return <UserProfile />;

      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Configurações</h2>
            <p className="text-gray-600">Esta seção estará disponível em breve.</p>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Bem-vindo ao AssureLog</h2>
            <p className="text-gray-600 mb-4">
              Olá, <strong>{user?.username}</strong>! Selecione uma opção no menu para começar.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Criar Novo Relatório
              </button>
              <button
                onClick={() => handleViewChange('reports')}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Ver Relatórios
              </button>
            </div>
          </div>
        );
    }
  }, [
    currentView,
    reportView,
    selectedReport,
    selectedTestCase,
    user,
    handleCreateNew,
    handleViewReport,
    handleEditReport,
    handleBackToList,
    handleReportSaved,
    handleViewChange,
    handleNewTestCase,
    handleEditTestCase,
    handleTestCaseSavedOrCanceled,
    // handleExcelImport,
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={user}
        currentView={currentView}
        onViewChange={handleViewChange}
      // onExcelImport={handleExcelImport}
      // onLogout={portalLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent}
      </main>

      {/* {showExcelImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <ExcelImport
            reportId={selectedReport?.id}
            onImportSuccess={handleExcelImportSuccess}
            onClose={handleCloseExcelImport}
          />
        </div>
      )} */}
    </div>
  );
}

// Componente raiz
function AppAssure() {
  return <AuthenticatedApp />;
}

export default AppAssure;
