function loadLogin() {
    contentArea.innerHTML = `
        <section class="auth-section">
            <div class="auth-container">
                <h2>Autenticação</h2>
                <p>Escolha uma opção abaixo para continuar.</p>

                <div class="auth-mode">
                    <label for="modo-auth"><i class="fas fa-user-cog"></i> Escolha o modo:</label>
                    <select id="modo-auth" onchange="alternarModoAuth()">
                        <option value="login" selected>Entrar</option>
                        <option value="cadastro">Cadastrar</option>
                    </select>
                </div>

                <form id="auth-form">
                    <div id="campo-nome" style="display:none;">
                        <input type="text" id="nome" placeholder="* Nome completo">
                    </div>
                    <input type="email" id="email" placeholder="* Email" required>
                    <input type="password" id="senha" placeholder="* Senha" required>
                    
                    <div id="campos-cadastro-extra" style="display:none;">
                        <input type="text" id="telefone" placeholder="* Telefone" required>
                        <input type="text" id="endereco" placeholder="* Endereço" required>
                        <input type="text" id="cep" placeholder="* Cep" required>
                        <input type="text" id="cidade" placeholder="* Cidade" required>
                        <input type="text" id="pais" placeholder="País">
                    </div>

                    <div class="auth-buttons">
                        <button type="button" id="btn-login" onclick="fazerLogin()" class="btn btn-primary">
                            <i class="fas fa-sign-in-alt"></i> Entrar
                        </button>
                        <button type="button" id="btn-cadastro" onclick="fazerCadastroCliente()" class="btn btn-secondary" style="display:none;">
                            <i class="fas fa-user-plus"></i> Cadastrar
                        </button>
                    </div>
                </form>
            </div>
        </section>
    `;
}

function alternarModoAuth() {
    const modo = document.getElementById('modo-auth').value;
    const campoNome = document.getElementById('campo-nome');
    const camposExtra = document.getElementById('campos-cadastro-extra');
    const btnLogin = document.getElementById('btn-login');
    const btnCadastro = document.getElementById('btn-cadastro');

    if (modo === 'cadastro') {
        campoNome.style.display = 'block';
        camposExtra.style.display = 'block';
        btnLogin.style.display = 'none';
        btnCadastro.style.display = 'inline-block';
    } else {
        campoNome.style.display = 'none';
        camposExtra.style.display = 'none';
        btnLogin.style.display = 'inline-block';
        btnCadastro.style.display = 'none';
    }
}

/** Função de Login do Cliente **/
async function fazerLoginCliente() {
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();

    if (!email || !senha) {
        showMessage('Por favor, preencha email e senha.', 'error');
        return;
    }

    try {
        // OAuth2PasswordRequestForm espera "username" e "password"
        const res = await fetch("http://localhost:8000/api/auth/clientes/login", {
        // const res = await fetch("https://synchrogest-app.onrender.com/api/auth/clientes/login", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ username: email, password: senha })
        });


        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token_cliente", data.access_token);
            showMessage("Login realizado com sucesso!", "success");

            // Redireciona para finalizar compra ou página principal
            const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
            if (carrinho.length > 0) {
                loadPage("checkout"); // direciona para checkout se houver itens
            } else {
                loadPage("produtos");
            }

        } else {
            showMessage(data.detail || "Erro ao realizar login.", "error");
        }
    } catch (e) {
        showMessage(`Falha no login: ${e.message}`, "error");
    }
}

/** Função de cadastro do Cliente **/
async function fazerCadastroCliente() {
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const cep = document.getElementById('cep').value.trim();
    const cidade = document.getElementById('cidade').value.trim();
    const pais = document.getElementById('pais').value.trim();

    if (!email || !senha || !nome || !telefone || !endereco || !cep || !cidade) {
        showMessage('Preencha os campos obrigatórios.', 'warning');
        return;
    }

    try {
        const res = await fetch("http://localhost:8000/api/clientes/", {
        // const res = await fetch("https://synchrogest-app.onrender.com/api/clientes/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, senha, telefone, endereco, cep, cidade, pais })
        });


        const data = await res.json();

        if (res.ok) {
            showMessage("Cadastro realizado com sucesso! Redirecionando...", "success");

            // Limpar formulário e alternar para login
            document.getElementById('auth-form').reset();
            document.getElementById('modo-auth').value = 'login';
            alternarModoAuthCliente();

            // Auto-login após cadastro
            await fazerLoginCliente();

        } else {
            showMessage(data.detail || "Erro ao cadastrar.", "error");
        }

    } catch (e) {
        showMessage(`Falha no cadastro: ${e.message}`, "error");
    }
}

