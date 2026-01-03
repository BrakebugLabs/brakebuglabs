function loadPage(page) {
    contentArea.innerHTML = '';
    switch (page) {
        case 'home': loadHome(); break;
        case 'produtos': loadProdutos(); break;
        case 'carrinho': loadCarrinho(); break;
        case 'pagamentos': loadPagamentos();break;
        case 'login': loadLogin(); break;
        default: loadHome();
    }
}

function loadHome() {
    contentArea.innerHTML = `
        <section class="hero">
            <div class="hero-content">
                <div class="hero-text">
                    <h2>Bem-vindo à <span>Biscoito Pet House!</span></h2>
                    <p>O melhor lugar para cuidar, mimar e alegrar o seu pet.</p>
                    <a href="#" onclick="loadPage('produtos')" class="btn btn-primary">Ver Produtos</a>
                </div>
                <div class="hero-image">
                    <img src="./assets/images/heros/cão-e-gato.jpg" alt="Cachorro e gato feliz">
                </div>
            </div>
        </section>
        
        <section class="features">
            <h3 class="section-title">Por que escolher a Biscoito Pet House?</h3>
            <div class="feature-grid">
                <div class="feature-card">
                    <i class="fas fa-truck"></i>
                    <h4>Entrega Rápida</h4>
                    <p>Receba seus pedidos em até 48 horas, direto na sua porta.</p>
                </div>
                <div class="feature-card">
                    <i class="fas fa-heart"></i>
                    <h4>Produtos Selecionados</h4>
                    <p>Selecionamos com carinho os melhores itens para o bem-estar do seu pet.</p>
                </div>
                <div class="feature-card">
                    <i class="fas fa-shield-alt"></i>
                    <h4>Compra Segura</h4>
                    <p>Pagamentos e dados protegidos com tecnologia JWT.</p>
                </div>
            </div>
        </section>
    `;
}

