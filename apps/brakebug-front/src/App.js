import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

//import.css
import './styles/theme.css';
import './styles/layout.css';
import './styles/components.css';
// import './styles/bootstrap.css';

// Páginas
import Portal from './portal/pages/Portal';
import AppAssure from './AppAssure';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Produtos from './pages/produtos/Produtos';
import Categorias from './pages/categorias/Categorias';
import Movimentacoes from './pages/movimentacoes/Movimentacoes';
// import Usuarios from './pages/auth/Usuarios';
import UsuariosPortal from './portal/pages/UsuariosPortal';



import Clientes from './pages/clientes/Clientes';
import Vendas from './pages/vendas/Vendas';
import Pagamentos from './pages/pagamentos/Pagamentos';
import NotFound from './pages/common/NotFound';

// Componentes
import PrivateRoute from './components/auth/PrivateRoute';
import MainLayout from './components/layout/MainLayout';
// import '../../portal/portal.css';

function App() {

  // Teste de comunicação com backend via proxy
  useEffect(() => {
    fetch('/api/test')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => console.log('RESPOSTA BACKEND (via proxy test):', data))
      .catch(err => console.error('ERRO DE TESTE PROXY:', err));
  }, []);

  return (
    <Routes>

      {/* ROTAS PÚBLICAS */}
      <Route path="/login" element={<Login />} />

      {/* ROTAS PROTEGIDAS */}

      {/* 🚀 Portal Brakebug (página inicial após login) */}
      <Route
        path="/portal"
        element={
          <PrivateRoute>
            <Portal />
          </PrivateRoute>
        }
      />

      <Route
        path="/portal/assurelog/*"
        element={
          <PrivateRoute>
            <AppAssure />
          </PrivateRoute>
        }
      />


      {/* --- ADMIN DO PORTAL (NOVO) --- */}
      <Route path="/portal/admin/usuarios" element={<UsuariosPortal />} />

      {/* 🔹 SynchroGest dentro do BRAKEBUG LABS */}
      <Route path="/app" element={<PrivateRoute><MainLayout /></PrivateRoute>}>

        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/app/dashboard" element={<Dashboard />} />
        <Route path="/app/produtos" element={<Produtos />} />
        <Route path="/app/categorias" element={<Categorias />} />
        <Route path="/app/movimentacoes" element={<Movimentacoes />} />
        {/* <Route path="/app/usuarios" element={<Usuarios />} /> */}

        <Route path="/app/clientes" element={<Clientes />} />
        <Route path="/app/vendas" element={<Vendas />} />
        <Route path="/app/pagamentos" element={<Pagamentos />} />
      </Route>

      {/* ROOT → portal (nova regra) */}
      <Route path="/" element={<Navigate to="/portal" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}

export default App;
