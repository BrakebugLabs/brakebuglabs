import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const bootstrapAuth = async () => {
            const token = localStorage.getItem('@SynchroGest:token');

            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                try {
                    const response = await api.get('/auth/me');
                    const userData = response.data;

                    setUser(userData);
                    localStorage.setItem('@SynchroGest:user', JSON.stringify(userData));
                } catch (err) {
                    console.warn('Token inválido ou expirado, forçando logout.', err);

                    localStorage.removeItem('@SynchroGest:token');
                    localStorage.removeItem('@SynchroGest:user');
                    delete api.defaults.headers.common['Authorization'];
                    setUser(null);
                }
            }

            setLoading(false);
        };

        bootstrapAuth();
    }, []);

    const signIn = async (email, password) => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            params.append('username', email);
            params.append('password', password);

            const response = await api.post('/auth/login', params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const { access_token } = response.data;

            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            localStorage.setItem('@SynchroGest:token', access_token);

            const userResponse = await api.get('/auth/me');
            const userData = userResponse.data;

            localStorage.setItem('@SynchroGest:user', JSON.stringify(userData));
            setUser(userData);

            /** 🔥 NOVO FLUXO — vai para o Portal Brakebug */
            navigate('/portal');

            toast.success('Login realizado com sucesso!');
        } catch (error) {
            toast.error('Erro ao fazer login. Verifique suas credenciais.');
            console.error('Erro ao fazer login:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const signOut = () => {
        localStorage.removeItem('@SynchroGest:token');
        localStorage.removeItem('@SynchroGest:user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);

        navigate('/login');
        toast.info('Logout realizado com sucesso!');
    };

    return (
        <AuthContext.Provider
            value={{
                signed: !!user,
                user,
                loading,
                signIn,
                signOut
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}

export default AuthContext;
