// src/portal/pages/Portal.jsx
import React from 'react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import PortalHeader from '../components/PortalHeader';
import PortalFooter from '../components/PortalFooter';
import PortalCard from '../components/PortalCard';
import LoginBox from '../components/LoginBox';

// import .css
import '../../portal/styles/theme.css';
import '../../portal/styles/portal.css';
import '../../portal/styles/login.css';
import '../../portal/styles/hero.css';
import '../../portal/styles/footer.css';

const Portal = () => {
  const { signed, user } = useAuth();
  const navigate = useNavigate();

  const apps = [
    {
      id: 'gestao',
      image: '/assets/images/template-gerenciador.png',
      title: 'SynchroGest',
      description: 'Gestão de estoque, clientes e vendas.',
      action: () => navigate('/app/dashboard'),
      external: false
    },
    {
      id: 'bph',
      image: '/assets/images/template-site-biscoito.png',
      title: 'Biscoito Pet House',
      description: 'Loja de testes — abre em nova aba.',
      // action: () => window.open("https://biscoito-pet-house.onrender.com", "_blank"),
      action: () => window.open('/bph/index.html', '_blank'),
      external: false
    },
    {
      id: 'assurelog',
      image: '/assets/images/lupa-bug.jpeg',
      title: 'Assure Log',
      description: 'Crie relatórios',
      action: () => window.open('/portal/assurelog', "_blank"),
      external: false
    },
  ];

  const game = [
    {
      id: 'ranking',
      title: 'Ranking QA',
      description: 'Pontuação, badges e classificação.',
      url: '/portal/ranking',
      color: '#7D4AFF',
      external: false,
    },
    {
      id: 'gamificacao',
      title: 'Gamificação',
      description: 'Seu XP, conquistas e evolução.',
      url: '/portal/gamificacao',
      color: '#2ECC71',
      external: false,
    },
  ]

  return (
    <div className="portal-root bb-portal-root">
      <PortalHeader user={user} signed={signed} />

      <main className="bb-portal-main content-wrapper-center">
        <div className=''></div>

        {/* HERO */}
        <section className="bb-hero hero row template-bio">
          <div className="content sm-12 lg-7">
            <div className='content-title'>
              <header>
                <div className='container-hero-title'>
                  <h2 spanclassName="hero-title"><span>Pratique como um verdadeiro QA</span></h2>
                </div>
                <div className='hero-content-title'>
                  <p>✓ Teste</p>
                  <p>✓ Reporte</p>
                  <p>✓ Evolua!</p>
                </div>
              </header>
            </div>
            {!signed && <p className="text-muted">Faça login para desbloquear os aplicativos.</p>}
          </div>
        </section>

        {/* Login Box */}
        <div className="sm-12 md-3 lg-4 login-box-wrapper">
          <LoginBox />
        </div>

        {/* GRID LOGIN + APPS */}
        <section className="bb-portal-grid" style={{ marginTop: '2rem' }}>
          <h2 className="bb-apps-title">Nossos APPs</h2>

          <div className='grid-card-content'>
            <div className="row">

              {/* Apps */}
              <div className="sm-12 md-9 lg-8 portal-card-apps">
                {apps.map(app => (
                  <PortalCard
                    key={app.id}
                    image={app.image}
                    // title={item.title}
                    // description={item.description}
                    disabled={!signed}
                    onClick={app.action}
                    external={app.external}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= ÁREA DE GAMIFICAÇÃO ================= */}
        <section className="bb-portal-game">

          <h2 className="bb-game-title">
            Gamificação & Ranking
          </h2>

          <div className='grid-card-content'>
            <div className="row">
              <div className="sm-12 md-9 lg-8 bb-game-buttons">

                <button
                  className="bb-game-btn ranking"
                  disabled={!signed}
                  onClick={() => navigate('/portal/ranking')}
                >
                  🏆 Ranking QA
                </button>

                <button
                  className="bb-game-btn gamification"
                  disabled={!signed}
                  onClick={() => navigate('/portal/gamificacao')}
                >
                  ⚡ Gamificação
                </button>
              </div>
            </div>
          </div>

          {!signed && (
            <p className="text-muted" style={{ marginTop: '1rem' }}>
              Faça login para acessar gamificação e ranking.
            </p>
          )}
        </section>


      </main>

      <PortalFooter />
    </div>
  );
};

export default Portal;
