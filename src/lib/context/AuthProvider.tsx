import {FC, useEffect, useState} from 'react';
import AuthContext from './AuthContext';
import {STORE_KEYS} from '../constants/store';
import {getServerApi, handleResponse} from '../../api/utils';
import {ProviderProps} from './hooks';
import {UserResponseData} from '../../api/generated';
// import FingerprintJS from '@fingerprintjs/fingerprintjs';

const AuthProvider: FC<ProviderProps> = ({children}) => {
    const [user, setUser] = useState<UserResponseData | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);


    useEffect(() => {
        // 初始化时从localStorage恢复并验证 token 的有效性
        const initAuth = async () => {
            const storedToken = localStorage.getItem(STORE_KEYS.TOKEN);

            // 没有token，重置用户状态
            if (!storedToken) {
                _reset();
                setInitialized(true);
                return;
            }

            // 有token，设置token
            updateToken(storedToken);

            // 调用API验证令牌有效性并获取最新的用户信息
            try {
                // const fp = await FingerprintJS.load();
                // const {visitorId} = await fp.get();
                // console.log(visitorId)

                await handleResponse(getServerApi().authentication.authControllerAccount(), {
                    onSuccess: updateUser,
                    onError: (msg) => {
                        if (msg !== 'Internal Server Error') {
                            _reset();
                        }
                    },
                });
            } catch (error) {
                _reset();
                console.error('Failed to validate token', error);
            } finally {
                setInitialized(true);
            }
        };

        initAuth().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const logout = async (isLogoutAll: boolean = false) => {
        const co = getServerApi().authentication
        try {
            if (isLogoutAll) {
                await co.authControllerLogoutAll();
            } else {
                await co.authControllerLogout();
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
                initialized,
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