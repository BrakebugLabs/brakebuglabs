/** Função para finalizar compra */
async function finalizarCompra() {
    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    if (carrinho.length === 0) {
        showMessage("Seu carrinho está vazio.", "warning");
        return;
    }

    let token = localStorage.getItem("token_cliente");

    // Se não estiver logado, redireciona para login/cadastro
    if (!token) {
        showMessage("Você precisa estar logado para finalizar a compra.", "warning");
        // Salva a intenção de redirecionamento após login
        localStorage.setItem('redirectAfterLogin', 'finalizarCompra');
        loadLogin();
        return;
    }

    // Monta os itens diretamente do carrinho
    const itens = carrinho.map(item => ({
        produto_id: item.id,
        nome: item.nome,
        quantidade: item.quantidade,
        preco_unitario: parseFloat(item.preco_venda || 0)
    }));

    const total = itens.reduce((acc, item) => acc + (item.preco_unitario * item.quantidade), 0);

    try {
        const response = await fetch("http://localhost:8000/api/compras/", {
        // const response = await fetch("https://synchrogest-app.onrender.com/api/compras/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ itens, total })
        });

        if (response.ok) {
            showMessage("Compra finalizada com sucesso! Obrigado por comprar conosco 💛", "success");
            localStorage.removeItem("carrinho");
            loadCarrinho();
        } else {
            const data = await response.json();
            showMessage(`Erro ao finalizar compra: ${data.detail || 'Erro desconhecido'}`, "error");
        }
    } catch (error) {
        showMessage(`Falha na comunicação com o servidor: ${error.message}`, "error");
    }
}

/** Ajuste na função de login para redirecionar à finalização de compra */
async function fazerLogin() {
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();

    if (!email || !senha) {
        showMessage('Por favor, preencha email e senha.', 'error');
        return;
    }

    try {
        // OAuth2PasswordRequestForm espera "username" e "password" como form-urlencoded
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', senha);

        const res = await fetch("http://localhost:8000/api/auth/clientes/login", {
        // const res = await fetch("https://synchrogest-app.onrender.com/api/auth/clientes/login", {
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        });

        const data = await res.json();

        if (res.ok && data.access_token) {
            // Armazena token
            localStorage.setItem('token_cliente', data.access_token);

            // Mensagem de sucesso
            showMessage('Login realizado com sucesso!', 'success');

            // Limpa formulário e alterna para login
            document.getElementById('auth-form').reset();
            document.getElementById('modo-auth').value = 'login';
            alternarModoAuth();
            updateAuthLinks();

            // Verifica se precisa redirecionar para finalizar compra
            const redirectPage = localStorage.getItem('redirectAfterLogin');
            localStorage.removeItem('redirectAfterLogin');

            if (redirectPage === 'finalizarCompra') {
                finalizarCompra(); // Chama automaticamente a finalização de compra
            } else {
                loadPage(redirectPage || 'produtos'); // ou página padrão
            }
        } else {
            showMessage(data.detail || 'Falha no login.', 'error');
        }
    } catch (e) {
        showMessage(`Falha no login: ${e.message}`, 'error');
    }
}

/** Ajuste na função de cadastro para redirecionar à finalização de compra */
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
        const res = await fetch("http://localhost:8000/api/public/clientes/", {
        // const res = await fetch("https://synchrogest-app.onrender.com/api/public/clientes/", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nome, email, senha, telefone, endereco, cep, cidade, pais })
        });


        const data = await res.json();

        if (res.ok) {
            showMessage('Cadastro realizado com sucesso! Você já pode fazer login.', 'success');

            document.getElementById('auth-form').reset();
            document.getElementById('modo-auth').value = 'login';
            alternarModoAuth();

            // Redireciona automaticamente conforme intenção
            const redirectPage = localStorage.getItem('redirectAfterLogin');
            localStorage.removeItem('redirectAfterLogin');

            if (redirectPage === 'finalizarCompra') {
                loadLogin(); // Mostra login para o cliente se cadastrou
            } else {
                setTimeout(() => loadPage('produtos'), 2000);
            }
        } else {
            showMessage(data.detail || 'Erro ao cadastrar.', 'error');
        }
    } catch (e) {
        showMessage(`Falha no cadastro: ${e.message}`, 'error');
    }
}
