function loadPagamentos() {
    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    const token = localStorage.getItem("token_cliente");

    // Se carrinho vazio
    if (carrinho.length === 0) {
        contentArea.innerHTML = "<p>Seu carrinho está vazio.</p>";
        return;
    }

    // Renderiza página
    contentArea.innerHTML = `
        <h2>Finalizar Pagamento</h2>
        <div id="carrinho-resumo"></div>

        <label for="metodo">Método de Pagamento:</label>
        <select id="metodo">
            <option value="">Selecione...</option>
            <option value="cartao">Cartão de Crédito</option>
            <option value="pix">PIX</option>
            <option value="boleto">Boleto</option>
        </select>

        <button id="btn-pagar">Confirmar Pagamento</button>
        <div id="mensagem"></div>
    `;

    renderResumoCarrinho(carrinho);

    document.getElementById("btn-pagar").addEventListener("click", () => {
        finalizarPagamento(carrinho, token);
    });
}

function renderResumoCarrinho(carrinho) {
    const resumoDiv = document.getElementById("carrinho-resumo");
    resumoDiv.innerHTML = "";
    let total = 0;

    carrinho.forEach(item => {
        total += item.quantidade * item.preco_venda;
        resumoDiv.innerHTML += `<p>${item.nome} - ${item.quantidade} x R$ ${item.preco_venda.toFixed(2)}</p>`;
    });

    resumoDiv.innerHTML += `<strong>Total: R$ ${total.toFixed(2)}</strong>`;
}

async function finalizarPagamento(carrinho, token) {
    const metodo = document.getElementById("metodo").value;
    const mensagemDiv = document.getElementById("mensagem");

    if (!token) {
        showMessage("Você precisa estar logado para finalizar a compra.", "warning");
        localStorage.setItem('redirectAfterLogin', 'pagamentos');
        loadLogin();
        return;
    }

    if (!metodo) {
        showMessage("Selecione um método de pagamento.", "warning");
        return;
    }

    const itens = carrinho.map(item => ({
        produto_id: item.id,
        quantidade: item.quantidade,
        preco_unitario: parseFloat(item.preco_venda || 0)
    }));

    const total = itens.reduce((acc, item) => acc + (item.preco_unitario * item.quantidade), 0);

    try {
        const response = await fetch("http://localhost:8000/api/pagamentos/", {
            // const response = await fetch("https://synchrogest-app.onrender.com/api/pagamentos/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ itens, total, metodo })
        });

        if (response.ok) {
            showMessage("Pagamento realizado com sucesso! Obrigado 💛", "success");
            localStorage.removeItem("carrinho");
            setTimeout(() => loadPage("produtos"), 2000);
        } else {
            const data = await response.json();
            showMessage(`Erro ao processar pagamento: ${data.detail || 'Erro desconhecido'}`, "error");
        }
    } catch (error) {
        showMessage(`Falha na comunicação com o servidor: ${error.message}`, "error");
    }
}
