import { FC, useEffect, useState } from 'react';
import AuthContext, { ContextUser } from './AuthContext';
import { STORE_KEYS } from '../constants/store';
import { getServerApi } from '../../api/utils';
import { ProviderProps } from './hooks';

const AuthProvider: FC<ProviderProps> = ({ children }) => {
    const [user, setUser] = useState<ContextUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 初始化时从localStorage恢复用户会话
    useEffect(() => {
        const storedToken = localStorage.getItem(STORE_KEYS.TOKEN);
        if (storedToken) {
            setToken(storedToken);

            const storedUser = localStorage.getItem(STORE_KEYS.USER);
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error('Failed to parse stored user data', e);
                    localStorage.removeItem(STORE_KEYS.USER);
                }
            }
        } else {
            setUser(null);
            setToken(null);
            localStorage.removeItem(STORE_KEYS.USER);
            localStorage.removeItem(STORE_KEYS.TOKEN);
        }

        setIsLoading(false);
    }, []);

    // 如果 user/token 发生变化，则更新 localStorage
    useEffect(() => {
        if (user) {
            localStorage.setItem(STORE_KEYS.USER, JSON.stringify(user));
        } else {
            localStorage.removeItem(STORE_KEYS.USER);
        }
    }, [user]);

    useEffect(() => {
        if (token) {
            localStorage.setItem(STORE_KEYS.TOKEN, token);
        } else {
            localStorage.removeItem(STORE_KEYS.TOKEN);
        }
    }, [token]);

    const logout = async (isLogoutAll: boolean = false) => {
        try {
            if (isLogoutAll) {
                await getServerApi().authentication.authControllerLogoutAll();
            } else {
                await getServerApi().authentication.authControllerLogout();
            }
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            setUser(null);
            localStorage.removeItem(STORE_KEYS.USER);

            setToken(null);
            localStorage.removeItem(STORE_KEYS.TOKEN);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isLoading,
                user,
                setUser,
                token,
                setToken,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider; 