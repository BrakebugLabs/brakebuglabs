// URL base do backend
const API_BASE_URL =
    ['localhost', '127.0.0.1'].includes(window.location.hostname)
        ? 'http://localhost:8000'
        : 'https://synchrogest-app.onrender.com';



let token = localStorage.getItem('token') || '';
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

const contentArea = document.getElementById('content');
const cartCountElement = document.getElementById('cart-count');

// Atualiza contador do carrinho
function updateCartCount() {
    cartCountElement.textContent = carrinho.length;
}

// Atualiza visibilidade dos links Login/Sair
function updateAuthLinks() {
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');

    if (token) {
        loginLink.style.display = 'none';
        logoutLink.style.display = 'inline';
    } else {
        loginLink.style.display = 'inline';
        logoutLink.style.display = 'none';
    }
}

// Mostra mensagens temporárias
function showMessage(text, type = 'info') {
    const msg = document.createElement('div');
    msg.className = `alert alert-${type}`;
    msg.textContent = text;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 4000);
}

// Logout
function logout(shouldReload = true) {
    token = '';
    localStorage.removeItem('token');
    updateAuthLinks();
    showMessage('Você foi desconectado.');
    if (shouldReload) loadPage('home');
}

// Função genérica de fetch com token
async function fetchAPI(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

    if (!response.ok) {
        if (response.status === 401) {
            showMessage('Sessão expirada. Faça login novamente.', 'warning');
            logout(false);
            loadPage('login');
            throw new Error('Não autorizado');
        }

        const errorData = await response.json().catch(() => ({}));
        const message = errorData.detail || errorData.message || 'Erro desconhecido';
        throw new Error(message);
    }

    // Atualiza e remove quantidade - Funções utilitárias do carrinho

    function atualizarQuantidade(index, novaQuantidade) {
        if (novaQuantidade < 1) return;
        carrinho[index].quantidade = parseInt(novaQuantidade);
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        loadCarrinho();
    }

    function removerCarrinho(index) {
        carrinho.splice(index, 1);
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        loadCarrinho();
    }

    return response;
}
