import { FaArrowLeft, FaBars, FaBox, FaChartLine, FaClipboardList, FaHome, FaTags, FaUsers, FaTasks } from 'react-icons/fa';
import { Container, Nav, Navbar, Button, Offcanvas } from 'react-bootstrap';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useState } from 'react';


const MainLayout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const goToPortal = () => {
    navigate("/portal");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar  expand={false} className="mb-3">
        <Container fluid className='nav-container'>
          <div className="d-flex flex-column align-items-center">
            <Button
              variant="outline-light"
              className="me-2 d-md-none"
              onClick={handleShow}
            >
            </Button>
            <Navbar.Brand as={Link} to="/app/dashboard" className="logo-wrapper">
              <span className="logo-title">SynchroGest</span>
              <span className="logo-sub-title">by Brakebug Labs</span>
            </Navbar.Brand>
          </div>

          <Button
            variant="outline-light"
            onClick={goToPortal}
            className="d-flex align-items-center"
          >
            <FaArrowLeft className="me-2" /> Voltar
          </Button>
        </Container>
      </Navbar>

      <Container fluid className="flex-grow-1 d-flex container-content">
        {/* Sidebar Desktop */}
        <div className="d-none d-md-flex flex-column sidebar p-3">
          <Nav className="flex-column sidebar-content p-2">
            <Nav.Link as={Link} to="/app/dashboard" className={`mb-2 ${isActive('/app/dashboard') ? 'active' : ''}`}>
              <FaHome className="me-2" /> Dashboard
            </Nav.Link>

            <Nav.Link as={Link} to="/app/produtos" className={`mb-2 ${isActive('/app/produtos') ? 'active' : ''}`}>
              <FaBox className="me-2" /> Produtos
            </Nav.Link>

            <Nav.Link as={Link} to="/app/categorias" className={`mb-2 ${isActive('/app/categorias') ? 'active' : ''}`}>
              <FaTags className="me-2" /> Categorias
            </Nav.Link>

            <Nav.Link as={Link} to="/app/movimentacoes" className={`mb-2 ${isActive('/app/movimentacoes') ? 'active' : ''}`}>
              <FaChartLine className="me-2" /> Movimentações
            </Nav.Link>

            <Nav.Link as={Link} to="/app/clientes" className={`mb-2 d-flex ${isActive('/app/clientes') ? 'active' : ''}`} style={{ whiteSpace: 'nowrap' }}>
              <FaClipboardList className="me-3" /> Clientes
            </Nav.Link>

            <Nav.Link as={Link} to="/app/vendas" className={`mb-2 ${isActive('/app/vendas') ? 'active' : ''}`}>
              <FaTasks className="me-2" /> Vendas
            </Nav.Link>

            <Nav.Link as={Link} to="/app/pagamentos" className={`mb-2 ${isActive('/app/pagamentos') ? 'active' : ''}`}>
              <FaTasks className="me-2" /> Pagamentos
            </Nav.Link>

            {/* <Nav.Link as={Link} to="/app/usuarios" className={`mb-2 ${isActive('/app/usuarios') ? 'active' : ''}`}>
              <FaUsers className="me-2" /> Usuários
            </Nav.Link> */}
          </Nav>
        </div>

        {/* Sidebar Mobile */}
        <Offcanvas show={show} onHide={handleClose} className="sidebar-mobile">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menu</Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body>
            <Nav className="flex-column">
              <Nav.Link as={Link} to="/app/dashboard" className={`mb-2 ${isActive('/app/dashboard') ? 'active' : ''}`} onClick={handleClose}>
                <FaHome className="me-2" /> Dashboard
              </Nav.Link>

              <Nav.Link as={Link} to="/app/produtos" className={`mb-2 ${isActive('/app/produtos') ? 'active' : ''}`} onClick={handleClose}>
                <FaBox className="me-2" /> Produtos
              </Nav.Link>

              <Nav.Link as={Link} to="/app/categorias" className={`mb-2 ${isActive('/app/categorias') ? 'active' : ''}`} onClick={handleClose}>
                <FaTags className="me-2" /> Categorias
              </Nav.Link>

              <Nav.Link as={Link} to="/app/movimentacoes" className={`mb-2 ${isActive('/app/movimentacoes') ? 'active' : ''}`} onClick={handleClose}>
                <FaChartLine className="me-2" /> Movimentações
              </Nav.Link>

              <Nav.Link as={Link} to="/app/clientes" className={`mb-2 ${isActive('/app/clientes') ? 'active' : ''}`}>
                <FaClipboardList className="me-2" /> Clientes
              </Nav.Link>

              <Nav.Link as={Link} to="/app/vendas" className={`mb-2 ${isActive('/app/vendas') ? 'active' : ''}`} onClick={handleClose}>
                <FaClipboardList className="me-2" /> Vendas
              </Nav.Link>

              <Nav.Link as={Link} to="/app/pagamentos" className={`mb-2 ${isActive('/app/pagamentos') ? 'active' : ''}`} onClick={handleClose}>
                <FaClipboardList className="me-2" /> Pagamentos
              </Nav.Link>

              {/* <Nav.Link as={Link} to="/app/usuarios" className={`mb-2 ${isActive('/app/usuarios') ? 'active' : ''}`} onClick={handleClose}>
                <FaUsers className="me-2" /> Usuários
              </Nav.Link> */}
            </Nav>
          </Offcanvas.Body>
        </Offcanvas>

        <div className="flex-grow-1 content-area">
          <Outlet />
        </div>
      </Container>
    </div>
  );
};

export default MainLayout;