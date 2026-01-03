// src/portal/components/PortalHeader.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';
import { FaUserCircle, FaChevronDown, FaUsersCog, FaSignOutAlt, FaUser } from 'react-icons/fa';

const PortalHeader = ({ signed, user }) => {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setOpen((prev) => !prev);
    };

    const handleGoToUsers = () => {
        setOpen(false);
        navigate('/portal/admin/usuarios');
    };

    const handleGoToPerfil = () => {
        setOpen(false);
        navigate('/app/perfil');
    };

    const handleLogout = () => {
        setOpen(false);
        signOut();
    };

    // 📌 Fecha quando clicar fora
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);

        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <header className="portal-header" ref={rootRef}>
            <Link to="/portal" className="portal-logo">
                Brakebug Labs
            </Link>

            {!signed ? (
                <nav>
                    <a href="#sobre">Sobre</a>
                    <a href="#contato">Contato</a>
                </nav>
            ) : (
                <div className="user-dropdown" style={{ position: "relative" }}>
                    <button
                        className="user-info"
                        onClick={toggleDropdown}
                        type="button"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "6px 8px"
                        }}
                    >
                        <FaUserCircle style={{color: "#F6F6F6" }} size={28} />

                        <div style={{ textAlign: "left", color: "#F6F6F6" }}><strong >Perfil</strong>
                            {/* <strong>{user?.nome}</strong> */}
                            <div style={{ fontSize: 12, color: "#F6F6F6" }}>{user?.email}</div>
                        </div>

                        <FaChevronDown style={{color: "#F6F6F6" }} className={open ? "chevron open" : "chevron"} />
                    </button>

                    {open && (
                        <div
                            className="dropdown-menu"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                position: "absolute",
                                right: 0,
                                top: "calc(100% + 8px)",
                                background: "#fff",
                                borderRadius: 8,
                                padding: "6px 0",
                                boxShadow: "0 6px 20px rgba(16,24,40,0.12)",
                                minWidth: 220,
                                zIndex: 9999
                            }}
                        >
                            <button type="button" onClick={handleGoToPerfil} style={menuItemStyle}>
                                <FaUser style={{ marginRight: 10 }} /> Perfil
                            </button>

                            {user?.nivel_acesso === "admin" && (
                                <button type="button" onClick={handleGoToUsers} style={menuItemStyle}>
                                    <FaUsersCog style={{ marginRight: 10 }} /> Administração de Usuários
                                </button>
                            )}

                            <div style={{ height: 1, background: "#eee", margin: "6px 0" }} />

                            <button
                                type="button"
                                onClick={handleLogout}
                                style={{ ...menuItemStyle, color: "#b30000" }}
                            >
                                <FaSignOutAlt style={{ marginRight: 10 }} /> Sair
                            </button>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};

const menuItemStyle = {
    width: "100%",
    padding: "10px 16px",
    background: "none",
    border: "none",
    textAlign: "left",
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8
};

export default PortalHeader;
