import '../stylesassure/header.css';

export default function Header({ currentView, onViewChange, user }) {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <header className="assure-header">
      <div className="assure-header-left">
        <div className="assure-logo">AssureLog</div>

        <nav className="assure-nav">
          <button
            className={currentView === 'profile' ? 'active' : ''}
            onClick={() => onViewChange('profile')}
          >
            Perfil
          </button>

          <button
            className={currentView === 'reports' ? 'active' : ''}
            onClick={() => onViewChange('reports')}
          >
            Relatórios
          </button>

          <button
            className={currentView === 'search' ? 'active' : ''}
            onClick={() => onViewChange('search')}
          >
            Buscar
          </button>

        </nav>
      </div>

      <div className="assure-header-right">
        <div className="assure-user">
          <div className="assure-avatar">
            {getInitials(user?.username)}
          </div>
          <div className="assure-user-info">
            <span className="name">{user?.username}</span>
            <span className="email">{user?.email}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
