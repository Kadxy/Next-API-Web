import { FC, useEffect, useState } from 'react';
import AuthContext from './AuthContext';
import { STORE_KEYS } from '../constants/store';
import { getServerApi, handleResponse } from '../../api/utils';
import { ProviderProps } from './hooks';
import { UserResponseData } from '../../api/generated';

const AuthProvider: FC<ProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserResponseData | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 初始化时从localStorage恢复用户会话并验证token有效性
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem(STORE_KEYS.TOKEN);

            // 没有token，重置用户状态
            if (!storedToken) {
                _reset();
                setIsLoading(false);
                return;
            }

            // 有token，设置token
            updateToken(storedToken);

            // 调用API验证令牌有效性并获取最新的用户信息
            try {
                handleResponse(getServerApi().authentication.authControllerAccount(), {
                    onSuccess: (data) => updateUser(data),
                    onError: () => _reset(),
                });
            } catch (error) {
                _reset();
                console.error('Failed to validate token', error);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            _reset();
        }
    };

    const updateUser = (user: UserResponseData | null) => {
        setUser(user);
        if (user) {
            localStorage.setItem(STORE_KEYS.USER, JSON.stringify(user));
        } else {
            localStorage.removeItem(STORE_KEYS.USER);
        }
    };

    const updateToken = (token: string | null) => {
        setToken(token);
        if (token) {
            localStorage.setItem(STORE_KEYS.TOKEN, token);
        } else {
            localStorage.removeItem(STORE_KEYS.TOKEN);
        }
    };

    const _reset = () => {
        updateUser(null);
        updateToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                isLoading,
                user,
                setUser: updateUser,
                token,
                setToken: updateToken,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider; 