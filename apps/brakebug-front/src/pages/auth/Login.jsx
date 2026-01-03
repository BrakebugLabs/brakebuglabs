// src/pages/auth/Login.jsx
import React from 'react';
import LoginBox from '../../portal/components/LoginBox';
import LoginFooter from '../../portal/components/LoginFooter.jsx';
import '../../portal/styles/portal.css';

const Login = () => {
  return (
    <div className="login-page login-root">
      <header className="portal-header">
        <h1 className="portal-logo">Brakebug Labs</h1>
      </header>
      <main className="main-login content-wrapper-center">
        <section className="row login-row">
          <div className='login-page-content'>
            <div className='template-hero'>
              <div className="sm-12 lg-6 login-page-hero">
                <h2>Teste,  Aprenda,  Evolua!</h2>
                <p>Eleve seu nível.</p>
                <div className='background-image'><div className='login-img'></div></div>
              </div>
            </div>
            <div className="sm-12 lg-6 login-forms">
              <LoginBox />
            </div>
          </div>
        </section>

      </main>
      <LoginFooter />
    </div>
  );
};

export default Login;
