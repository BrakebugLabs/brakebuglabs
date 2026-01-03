function loadCadastroCliente() {
    contentArea.innerHTML = `
        <section class="auth-section">
            <div class="auth-container">
                <h2>Cadastro de Cliente</h2>
                <p>Crie sua conta para acessar os produtos e aproveitar todos os recursos da plataforma.</p>

                <form id="cadastro-form">
                    <input type="text" id="cliente-nome" placeholder="Nome completo" required>
                    <input type="email" id="cliente-email" placeholder="E-mail" required>
                    <input type="text" id="cliente-telefone" placeholder="Telefone (opcional)">
                    <input type="text" id="cliente-endereco" placeholder="Endereço (opcional)">
                    
                    <div class="auth-buttons">
                        <button type="button" onclick="fazerCadastroCliente()" class="btn btn-primary">
                            <i class="fas fa-user-plus"></i> Cadastrar
                        </button>
                        <button type="button" onclick="loadPage('login')" class="btn btn-secondary">
                            <i class="fas fa-arrow-left"></i> Voltar
                        </button>
                    </div>
                </form>

                <div id="mensagem-cadastro" class="mensagem"></div>
            </div>
        </section>
    `;
}

async function cadastrarCliente() {
    const nome = document.getElementById("cliente-nome").value.trim();
    const email = document.getElementById("cliente-email").value.trim();
    const telefone = document.getElementById("cliente-telefone").value.trim();
    const endereco = document.getElementById("cliente-endereco").value.trim();

    if (!nome || !email) {
        showMessage("Por favor, preencha os campos obrigatórios (nome e e-mail).", "warning");
        return;
    }

    try {


        // const response = await fetch("https://synchrogest-app.onrender.com/api/clientes", {
        const response = await fetch("http://localhost:8000/api/clientes/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, telefone, endereco })
        });


        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("cliente_id", data.id); // ✅ salva o ID retornado pelo backend
            showMessage(`Cliente cadastrado com sucesso! ID: ${data.id}`, "success");
            loadPage("produtos"); // redireciona para a loja
        } else {
            const data = await response.json();
            showMessage(`Erro ao cadastrar: ${data.detail || 'Erro desconhecido'}`, "error");
        }
    } catch (error) {
        showMessage(`Falha na comunicação com o servidor: ${error.message}`, "error");
    }
}
