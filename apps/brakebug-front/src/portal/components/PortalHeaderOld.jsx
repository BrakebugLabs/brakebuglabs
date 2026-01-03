// src/portal/components/PortalHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';

const PortalHeader = ({ signed, user }) => {
  const { signOut } = useAuth();

  return (
    <header className="portal-header">
      <Link to="/portal" className="portal-logo">Brakebug Labs</Link>

      {!signed ? (
        <nav>
          <a href="#sobre">Sobre</a>
          <a href="#contato">Contato</a>
        </nav>
      ) : (
        <div className="user-box">
          <div>
            <strong>{user?.nome}</strong>
            <div className="user-email">{user?.email}</div>
          </div>

          {/* Menu dropdown aqui envolvendo o botão sair */}
          {/* Exemplo:
          <NavDropdown.Item 
                  as={NavLink} 
                  to="/app/perfil" 
                >
                  Perfil
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={signOut}>Usuários</NavDropdown.Item>
                <button onClick={signOut}>Sair</button>
              </NavDropdown> */}

          <button onClick={signOut}>Sair</button>
        </div>
      )}
    </header>
  );
};

export default PortalHeader;
