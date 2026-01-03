/**
 * Exibe uma mensagem flutuante (toast) no canto superior direito.
 * @param {string} text - Texto da mensagem.
 * @param {'success' | 'error' | 'warning' | 'info'} type - Tipo da mensagem.
 */
function showMessage(text, type = 'info') {
    // Cria o container geral, se não existir
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // Cria o toast individual
    const toast = document.createElement('div');
    toast.classList.add('toast', `toast-${type}`);

    // Define o ícone por tipo
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${text}</span>
    `;

    container.appendChild(toast);

    // Animação de entrada
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove após 4 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
