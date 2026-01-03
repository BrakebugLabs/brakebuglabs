// src/portal/components/LoginBox.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/auth/AuthContext';
import api from '../../services/api';

const LoginBox = () => {
  const { signed, loading, signIn, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [waitSuccess, setWaitSuccess] = useState(null);
  const [showWaitForm, setShowWaitForm] = useState(false);

  if (signed) {
    return (
      <div className="login-box logged">
        {/* <h3>Bem-vindo{user?.nome ? `, ${user.nome}` : ''}!</h3> */}
        <h3>Confira o que praparamos para você.</h3>
        <p>Acesso os cards e inicie a sua jornada de testes</p>
      </div>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    await signIn(email, password);
  };

  const handleWaitingSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        nome: name,
        email: email,
        telefone: phoneNumber
      };

      const response = await api.post('/waiting-list/', data);

      setWaitSuccess(true);
      setName('');
      setEmail('');
      setPhoneNumber('');
    } catch (err) {
      console.error('Erro ao enviar lista de espera:', err);
      setWaitSuccess(false);
    }
  };

  return (
    <div className="login-init login-box ">
      <div className='content-form'>
        <h3>Fazer Login</h3>

        <form onSubmit={onSubmit}>
          <label>Email</label>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Senha</label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Abre um form e armazena o
      Nome:
      Email: (Fazer verificação de email antes de armazenar no banco de dados)
      Telefone (formato válido) */}

        <div className="waiting-list">
          <h3>Entre na lista</h3>

          <button
            type="button"
            className="waiting-list-user"
            onClick={() => setShowWaitForm((prev) => !prev)}
          >
            {showWaitForm ? 'Fechar' : 'Cadastre-se aqui'}
          </button>

          {showWaitForm && (
            <div className="waiting-form">
              <form onSubmit={handleWaitingSubmit}>

                <label>Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <label>Telefone</label>
                <input
                  type="tel"
                  pattern="[0-9]{9,15}"
                  placeholder="Apenas números"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />

                <button className='submit-list' type="submit">Enviar</button>

                {waitSuccess === true && (
                  <p style={{ color: 'green' }}>Cadastro enviado com sucesso!</p>
                )}
                {waitSuccess === false && (
                  <p style={{ color: 'red' }}>Erro ao enviar. Tente novamente.</p>
                )}
              </form>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LoginBox;
