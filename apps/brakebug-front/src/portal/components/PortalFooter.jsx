// src/portal/components/PortalFooter.jsx
import React from 'react';

const PortalFooter = () => {
  return (
    <footer className="portal-footer login-footer">
      <div className="content-wrapper-center">
        <div className="footer-content">
          <div>
            <h3 className="portal-logo">Brakebug Labs</h3>
            <p>Teste além do Óbvio!</p>
          </div>

          <div className="footer-contact">
            <h4>Contato</h4>
            <p>contato@brakebuglabs.com</p>
            <p>+351 910 000 000</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PortalFooter;
