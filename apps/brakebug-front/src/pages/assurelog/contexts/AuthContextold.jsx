// AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const decodeJWT = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join(''));
            return JSON.parse(jsonPayload);
        } catch {
            return null;
        }
    };

    const isTokenExpired = (token) => {
        if (!token) return true;
        const decoded = decodeJWT(token);
        if (!decoded || !decoded.exp) return true;
        return decoded.exp < Date.now() / 1000;
    };

    const logout = useCallback(async () => {
        try {
            if (token) {
                await authAPI.logout();
            }
        } catch {
        } finally {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
        }
    }, [token]);

    const verifyTokenInBackground = useCallback(async (tokenToVerify) => {
        try {
            const response = await authAPI.verifyToken(tokenToVerify);
            if (!response.valid) {
                console.log('Token inválido ou expirado — logout automático');
                logout();
            }
        } catch {
            // Evitar quebra de UI
            logout();
        }
    }, [logout]);

    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');

            if (!storedToken || isTokenExpired(storedToken)) {
                logout();
                return;
            }

            const decoded = decodeJWT(storedToken);
            if (decoded?.user_id && decoded?.username) {
                setToken(storedToken);
                setUser({
                    id: decoded.user_id,
                    username: decoded.username,
                    role: decoded.role || 'user'
                });
                setIsAuthenticated(true);
                setLoading(false);
                verifyTokenInBackground(storedToken);
            } else {
                logout();
            }
        };

        checkAuth();
    }, [logout, verifyTokenInBackground]);

    const updateUser = useCallback(async () => {
        try {
            if (!token) return logout();
            const response = await authAPI.getCurrentUser();
            setUser(response.user);
            return response.user;
        } catch (error) {
            if (error.response?.status === 401) logout();
        }
    }, [token, logout]);

    const isAdmin = () => user?.role === 'admin';
    const hasPermission = (permission) => {
        if (!user) return false;
        if (user.role === 'admin') return true;
        const permissions = {
            view_own_reports: true,
            create_reports: true,
            manage_users: false,
            view_all_reports: false
        };
        return permissions[permission] || false;
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            isAuthenticated,
            // login,
            // register,
            logout,
            updateUser,
            // changePassword,
            isAdmin,
            hasPermission
        }}>
            {children}
        </AuthContext.Provider>
    );
};
