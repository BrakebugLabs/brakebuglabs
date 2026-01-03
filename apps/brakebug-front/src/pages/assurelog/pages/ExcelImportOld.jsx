import { useState, useRef, useEffect, useCallback } from 'react' // Adicionado useEffect e useCallback
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Info, Download, Loader2 } from 'react' // Adicionado Loader2
import { importExcel, validateExcel, getExcelTemplate } from '../services/api'

export default function ExcelImport({ onImportSuccess, onClose }) {
  const [file, setFile] = useState(null)
  const [reportTitle, setReportTitle] = useState('')
  const [testEnvironment, setTestEnvironment] = useState('')
  const [featureScenario, setFeatureScenario] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [validationResult, setValidationResult] = useState(null)
  const [importResult, setImportResult] = useState(null)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: Upload, 2: Validation Result, 3: Form, 4: Import Result
  const [templateInfo, setTemplateInfo] = useState(null) // Mantido, mas não usado diretamente no template
  const fileInputRef = useRef(null)

  // Carregar informações do template ao montar o componente
  useEffect(() => {
    const loadInfo = async () => {
      try {
        const info = await getExcelTemplate()
        setTemplateInfo(info)
      } catch (err) {
        console.error('Erro ao carregar informações do template:', err)
        // Opcional: setError('Não foi possível carregar informações do template.');
      }
    }
    loadInfo()
  }, []) // Executa apenas uma vez ao montar

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError('')
      setValidationResult(null)
      setImportResult(null)
      
      // Auto-preencher título baseado no nome do arquivo
      if (!reportTitle) {
        const fileName = selectedFile.name.split('.')[0]
        setReportTitle(`Importação de ${fileName}`)
      }
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile)
      setError('')
      setValidationResult(null)
      setImportResult(null)
      
      if (!reportTitle) {
        const fileName = droppedFile.name.split('.')[0]
        setReportTitle(`Importação de ${fileName}`)
      }
    } else {
      setError('Por favor, selecione um arquivo Excel (.xlsx ou .xls)')
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const validateFile = async () => {
    if (!file) {
      setError('Por favor, selecione um arquivo para validar.')
      return
    }

    setIsValidating(true)
    setError('')
    setValidationResult(null) // Limpa o resultado de validação anterior

    try {
      const result = await validateExcel(file)
      setValidationResult(result)
      
      // === CORREÇÃO AQUI: Avance para o Step 2 para mostrar o resultado da validação ===
      setStep(2) 
      
      if (!result.valid) {
        setError('Arquivo Excel não possui a estrutura esperada ou contém erros. Verifique os detalhes abaixo.')
      }
    } catch (err) {
      setError(err.message || 'Erro ao validar arquivo. Verifique o console para mais detalhes.')
      console.error('Erro de validação:', err);
    } finally {
      setIsValidating(false)
    }
  }

  const handleImport = async () => {
    if (!file || !reportTitle.trim()) {
      setError('Título do relatório é obrigatório.')
      return
    }

    setIsImporting(true)
    setError('')
    setImportResult(null) // Limpa o resultado de importação anterior

    try {
      const result = await importExcel(file, {
        report_title: reportTitle,
        test_environment: testEnvironment,
        feature_scenario: featureScenario
      })
      
      setImportResult(result)
      setStep(4) // Mostrar resultado da importação
      
      if (onImportSuccess && result.report_id) { // Passa o ID do relatório se a importação foi bem-sucedida
        onImportSuccess(result)
      }
    } catch (err) {
      setError(err.message || 'Erro ao importar arquivo. Verifique o console para mais detalhes.')
      console.error('Erro de importação:', err);
    } finally {
      setIsImporting(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setReportTitle('')
    setTestEnvironment('')
    setFeatureScenario('')
    setValidationResult(null)
    setImportResult(null)
    setError('')
    setStep(1)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Renderização do Passo 1: Upload de Arquivo
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <FileSpreadsheet className="mx-auto h-12 w-12 text-green-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Importar Planilha Excel</h3>
        <p className="text-gray-600 mb-4">
          Faça upload de uma planilha Excel com seus casos de teste para criar um relatório automaticamente
        </p>
      </div>

      {/* Área de Drop */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-4" />
        <p className="text-gray-600 mb-2">
          Clique aqui ou arraste um arquivo Excel
        </p>
        <p className="text-sm text-gray-500">
          Formatos suportados: .xlsx, .xls
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {file && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">{file.name}</p>
              <p className="text-sm text-green-600">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Informações do Template */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Estrutura Esperada</h4>
            <p className="text-sm text-blue-700 mb-3">
              Sua planilha deve conter as seguintes colunas obrigatórias:
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              {/* Usar templateInfo se disponível, caso contrário, fallback para hardcoded */}
              {templateInfo?.required_columns?.length > 0 ? (
                templateInfo.required_columns.map((col, index) => (
                  <li key={index}>• <strong>{col.name}</strong> - {col.description}</li>
                ))
              ) : (
                <>
                  <li>• <strong>ID</strong> - Identificador do caso de teste (ex: CT001)</li>
                  <li>• <strong>Caso de Teste</strong> - Nome/título do teste</li>
                  <li>• <strong>Passo-a-passo</strong> - Descrição dos passos</li>
                  <li>• <strong>Resultado Esperado</strong> - O que deveria acontecer</li>
                </>
              )}
            </ul>
            {templateInfo?.optional_columns?.length > 0 && (
              <p className="text-sm text-blue-700 mt-3">
                Colunas opcionais: {templateInfo.optional_columns.map(col => col.name).join(', ')}
              </p>
            )}
            {/* Botão para baixar o template, se a informação estiver disponível */}
            {templateInfo?.template_url && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4 flex items-center gap-2"
                onClick={() => window.open(templateInfo.template_url, '_blank')}
              >
                <Download className="h-4 w-4" />
                Baixar Template
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={validateFile} 
          disabled={!file || isValidating}
          className="flex-1 flex items-center justify-center gap-2"
        >
          {isValidating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Validando...
            </>
          ) : (
            'Validar Arquivo'
          )}
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </div>
  )

  // Renderização do Passo 2: Resultado da Validação
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        {validationResult?.valid ? (
          <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
        ) : (
          <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
        )}
        <h3 className="text-lg font-semibold mb-2">Validação Concluída</h3>
        {!validationResult?.valid && (
          <p className="text-red-600 mb-4">
            O arquivo contém erros ou não segue a estrutura esperada.
          </p>
        )}
      </div>

      {validationResult && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total de Linhas</p>
              <p className="text-2xl font-bold">{validationResult.total_rows}</p>
            </div>
            <div className={`p-4 rounded-lg ${validationResult.valid ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-sm text-gray-600">Linhas Válidas</p>
              <p className={`text-2xl font-bold ${validationResult.valid ? 'text-green-600' : 'text-red-600'}`}>
                {validationResult.valid_rows}
              </p>
            </div>
          </div>

          {validationResult.invalid_rows?.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong className="block mb-1">Linhas com dados incompletos:</strong>
                <ul className="list-disc list-inside space-y-0.5 max-h-40 overflow-y-auto"> {/* Adicionado overflow-y-auto */}
                  {validationResult.invalid_rows.map((row, index) => (
                    <li key={index}>Linha {row}: Dados obrigatórios ausentes ou inválidos.</li>
                  ))}
                </ul>
                <p className="mt-2 text-sm">Essas linhas serão ignoradas durante a importação.</p>
              </AlertDescription>
            </Alert>
          )}

          {/* Prévia dos dados da planilha (apenas as primeiras linhas) */}
          {validationResult.preview_data && validationResult.preview_data.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto"> {/* Adicionado overflow-y-auto */}
              <h4 className="font-medium text-gray-800 mb-2">Prévia dos Dados (Primeiras Linhas)</h4>
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                  <tr>
                    {validationResult.preview_data[0] && Object.keys(validationResult.preview_data[0]).map((key) => (
                      <th key={key} scope="col" className="px-3 py-2">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {validationResult.preview_data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="bg-white border-b hover:bg-gray-50">
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex} className="px-3 py-2 whitespace-nowrap">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={() => setStep(3)} disabled={!validationResult?.valid} className="flex-1">
          Continuar para Configuração
        </Button>
        <Button variant="outline" onClick={() => resetForm()}> {/* Volta para o passo 1 e reseta */}
          Importar Outro Arquivo
        </Button>
      </div>
    </div>
  )

  // Renderização do Passo 3: Configurar Importação (Metadados do Relatório)
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <FileSpreadsheet className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Configurar Importação</h3>
        <p className="text-gray-600">
          Preencha as informações do relatório que será criado
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="reportTitle">Título do Relatório *</Label>
          <Input
            id="reportTitle"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            placeholder="Ex: Testes de API - Login"
            required
          />
        </div>

        <div>
          <Label htmlFor="testEnvironment">Ambiente de Teste</Label>
          <Input
            id="testEnvironment"
            value={testEnvironment}
            onChange={(e) => setTestEnvironment(e.target.value)}
            placeholder="Ex: Chrome 134.0, Windows 11 Pro"
          />
        </div>

        <div>
          <Label htmlFor="featureScenario">Feature/Cenário</Label>
          <Textarea
            id="featureScenario"
            value={featureScenario}
            onChange={(e) => setFeatureScenario(e.target.value)}
            placeholder="Ex: Autenticação de usuários / Login"
            rows={3}
          />
        </div>
      </div>

      {validationResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Resumo da Importação</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• {validationResult.valid_rows} casos de teste serão importados</li>
            <li>• Arquivo: {file?.name}</li>
            {validationResult.invalid_rows?.length > 0 && (
              <li>• {validationResult.invalid_rows.length} linhas serão ignoradas</li>
            )}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <Button 
          onClick={handleImport} 
          disabled={!reportTitle.trim() || isImporting}
          className="flex-1 flex items-center justify-center gap-2"
        >
          {isImporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Importando...
            </>
          ) : (
            'Importar Dados'
          )}
        </Button>
        <Button variant="outline" onClick={() => setStep(2)}> {/* Voltar para o passo 2 (resultado da validação) */}
          Voltar
        </Button>
      </div>
    </div>
  )

  // Renderização do Passo 4: Resultado da Importação
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Importação Concluída!</h3>
        <p className="text-gray-600">
          Seus dados foram importados com sucesso
        </p>
      </div>

      {importResult && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-3">Resultado da Importação</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-green-600">Casos Importados</p>
                <p className="text-2xl font-bold text-green-800">{importResult.imported_count}</p>
              </div>
              <div>
                <p className="text-sm text-green-600">Total de Linhas</p>
                <p className="text-2xl font-bold text-green-800">{importResult.total_rows}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-green-600 mb-1">Relatório Criado</p>
              <p className="font-medium text-green-800">{importResult.report_title}</p>
            </div>
          </div>

          {importResult.errors && importResult.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Avisos durante a importação:</strong>
                <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto"> {/* Adicionado overflow-y-auto */}
                  {importResult.errors.map((error, index) => (
                    <li key={index} className="text-sm">• {error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={onClose} className="flex-1">
          Fechar
        </Button>
        <Button variant="outline" onClick={resetForm}>
          Importar Outro Arquivo
        </Button>
      </div>
    </div>
  )

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Importar Excel
        </CardTitle>
        <CardDescription>
          Importe casos de teste de uma planilha Excel para criar relatórios automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-[70vh] overflow-y-auto"> {/* Adicionado max-height e overflow-y-auto aqui */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </CardContent>
    </Card>
  )
}
