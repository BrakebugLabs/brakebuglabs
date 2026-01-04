const API_BASE_URL = "http://localhost:8000/api";

// const API_BASE_URL =
//     ['localhost', '127.0.0.1'].includes(window.location.hostname)
//         ? 'http://localhost:8000'
//         : 'https://synchrogest-app.onrender.com';

class ApiService {
  constructor() {
  }
  setToken(token) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Lê o token do localStorage sempre que é chamada ===
  getAuthHeaders() {
    // Acessa o localStorage diretamente para garantir o token mais atualizado.
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || `HTTP error! status: ${response.status}`);
        error.response = { status: response.status, data: errorData };
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Helper para construir query string
  buildQueryString(params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    return searchParams.toString();
  }

  // Reports endpoints (usando rotas seguras)
getReports(filters = {}) {
  const qs = this.buildQueryString(filters);
  return this.request(`/secure-reports/reports${qs ? `?${qs}` : ''}`);
}

getReport(id) {
  return this.request(`/secure-reports/reports/${id}`);
}

createReport(data) {
  return this.request('/reports', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

updateReport(id, data) {
  return this.request(`/secure-reports/reports/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

deleteReport(id) {
  return this.request(`/secure-reports/reports/${id}`, {
    method: 'DELETE',
  });
}

  // Test Cases endpoints
  async createTestCase(reportId, testCaseData) {
    return this.request(`/reports/${reportId}/test-cases`, {
      method: 'POST',
      body: JSON.stringify(testCaseData),
    });
  }

  async updateTestCase(testCaseId, testCaseData) {
    return this.request(`/test-cases/${testCaseId}`, {
      method: 'PUT',
      body: JSON.stringify(testCaseData),
    });
  }

  //   /secure-reports/reports/:id/test-cases

  async deleteTestCase(testCaseId) {
    return this.request(`/test-cases/${testCaseId}`, {
      method: 'DELETE',
    });
  }

  // Search endpoints
  async quickSearch(query, limit = 10) {
    const queryString = this.buildQueryString({ q: query, limit });
    return this.request(`/search/quick?${queryString}`);
  }

  async getSearchSuggestions() {
    return this.request('/search/suggestions');
  }

  async getSearchStats() {
    return this.request('/search/stats');
  }

  // Upload endpoints
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE_URL}/upload`;
    const config = {
      method: 'POST',
      headers: {
        // Não definir Content-Type para FormData (deixar o browser definir)
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined,
      },
      body: formData,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || `HTTP error! status: ${response.status}`);
        error.response = { status: response.status, data: errorData };
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }

  // PDF export endpoints
  async exportReportToPDF(reportId) {
    // A rota correta já inclui /api/reports, então não precisamos do replace
    const url = `${API_BASE_URL}/reports/${reportId}/export-pdf`;
    const config = {
      headers: this.getAuthHeaders(),
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Tentar ler a mensagem de erro do backend se disponível
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return response.blob();
    } catch (error) {
      console.error('PDF export failed:', error);
      throw error;
    }
  }

  async exportAllReportsToPDF() {
    // A rota correta já inclui /api/reports, então não precisamos do replace
    const url = `${API_BASE_URL}/reports/export-all-pdf`;
    const config = {
      headers: this.getAuthHeaders(),
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Tentar ler a mensagem de erro do backend se disponível
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return response.blob();
    } catch (error) {
      console.error('PDF export failed:', error);
      throw error;
    }
  }

  // Métodos para importação Excel
  async validateExcel(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/excel/validate`, {
        method: 'POST',
        headers: {
          'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao validar arquivo Excel');
      }

      return await response.json();
    } catch (error) {
      console.error('Excel validation failed:', error);
      throw error;
    }
  }

  async importExcel(file, metadata = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Adicionar metadados do relatório
      Object.keys(metadata).forEach(key => {
        if (metadata[key]) {
          formData.append(key, metadata[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/excel/import`, {
        method: 'POST',
        headers: {
          'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao importar arquivo Excel');
      }

      return await response.json();
    } catch (error) {
      console.error('Excel import failed:', error);
      throw error;
    }
  }

  async getExcelTemplate() {
    try {
      // A chamada para this.request já usa o getAuthHeaders, que agora é dinâmico.
      return await this.request('/excel/template');
    } catch (error) {
      console.error('Failed to get Excel template info:', error);
      throw error;
    }
  }
}

const apiService = new ApiService();
// Exportar métodos específicos para facilitar o uso
// export const adminAPI = new AdminAPI();
export const validateExcel = (file) => apiService.validateExcel(file);
export const importExcel = (file, metadata) => apiService.importExcel(file, metadata);
export const getExcelTemplate = () => apiService.getExcelTemplate();

export default apiService;
