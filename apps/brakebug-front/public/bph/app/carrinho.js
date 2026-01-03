/* app/carrinho.js
   Carrinho compatível com localStorage e vitrine produtos.js
*/

// async function loadCarrinho() {
window.loadCarrinho = async function() {
    const contentArea = document.getElementById('content') || window.contentArea;
    if (!contentArea) {
        console.error('Elemento #content não encontrado.');
        return;
    }

    contentArea.innerHTML = '<h2>Seu Carrinho</h2>';

    // Carrega o carrinho salvo (ou vazio)
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    if (carrinho.length === 0) {
        contentArea.innerHTML += `
            <div class="carrinho_vazio">
                <img src="./assets/images/heros/cão_farejador.png" alt="Cachorro farejando" class="empty-cart-img">
                <p>Seu carrinho está vazio. 
                    <a href="#" onclick="loadPage('produtos')">Adicionar produtos</a>
                </p>
            </div>`;
        return;
    }

    // Tenta carregar produtos reais do backend
    let produtosAPI = [];
    try {
        const response = await fetchAPI('/api/produtos');
        // const response = await fetchAPI('/produtos'); // com bug (Não aparece o preço do produto)
        produtosAPI = await response.json();
    } catch (err) {
        console.warn('⚠️ Não foi possível carregar produtos do backend, usando fallback.', err);
    }

    let total = 0;
    let html = '<div id="carrinho-list">';

    carrinho.forEach((item, index) => {
        const produto = produtosAPI.find(p => p.id === item.id) || item;

        // Bug de preço
        // const preco = parseFloat(produto.preco_venda || produto.preco || 0);

        //const preco = produto.preco_venda !== undefined ? parseFloat(produto.preco_venda) : 0;
        const preco = produto.preco_venda && !isNaN(produto.preco_venda)
            ? parseFloat(produto.preco_venda)
            : 0;



        const subtotal = preco * item.quantidade;
        total += subtotal;

        html += `
            <div class="carrinho-item">
            <img class="carrinho-img" src="${produto.imagem_url || './assets/images/produtos/default.png'}" alt="${produto.nome}">
                <div class="carrinho-item-details">
                    <h4>${produto.nome || 'Produto sem nome'}</h4>
                    <p>Preço: R$ ${preco.toFixed(2).replace('.', ',')}</p>
                    <label>Quantidade:
                        <input type="number" min="1" value="${item.quantidade}" 
                            onchange="atualizarQuantidade(${index}, this.value)">
                    </label>
                    <p>Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}</p>
                </div>
                <button class="btn" onclick="removerCarrinho(${index})">
                    <i class="fas fa-trash"></i> Remover
                </button>
            </div>
        `;
    });

    html += `
        </div>
        <div class="carrinho-total">
            <strong>Total: R$ ${total.toFixed(2).replace('.', ',')}</strong>
        </div>
        <div style="text-align: right; margin-top: 20px;">
            <button class="btn-finaliza btn-primary" onclick="finalizarCompra()">
                <i class="fas fa-credit-card"></i> Finalizar Compra
            </button>
        </div>
    `;

    contentArea.innerHTML += html;
}

/* --- Funções auxiliares --- */

// Atualiza quantidade e salva no localStorage
function atualizarQuantidade(index, novaQuantidade) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    if (novaQuantidade < 1) return;
    carrinho[index].quantidade = parseInt(novaQuantidade);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    loadCarrinho();
    updateCartCount();
}

// Remove produto do carrinho
function removerCarrinho(index) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    carrinho.splice(index, 1);

    if (carrinho.length === 0) {
        localStorage.removeItem('carrinho'); // limpa completamente
    } else {
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
    }

    loadCarrinho();
    updateCartCount();
}

//===============================================================

// Remove produto do carrinho e salva (com bug)
// function removerCarrinho(index) {
//     let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
//     carrinho.splice(index, 1);
//     localStorage.setItem('carrinho', JSON.stringify(carrinho));
//     loadCarrinho();
//     updateCartCount();
// }

//===========================================================

// Atualiza contador no header
function updateCartCount() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const total = carrinho.reduce((acc, item) => acc + (item.quantidade || 0), 0);
    const el = document.getElementById('cart-count');
    if (el) el.textContent = total;
}
