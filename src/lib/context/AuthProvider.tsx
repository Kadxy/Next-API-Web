import { ReactNode, useEffect, useState } from 'react';
import AuthContext from './AuthContext';
import { User } from './types';

interface AuthProviderProps {
    children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 初始化时从localStorage恢复用户会话
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse stored user data', e);
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        // 这里模拟登录请求
        setIsLoading(true);

        try {
            // 模拟网络延迟
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 简单的验证逻辑，实际项目中应该调用API
            if (username && password.length >= 6) {
                const newUser: User = {
                    id: '1',
                    username,
                    avatar: username.charAt(0).toUpperCase(),
                };

                setUser(newUser);
                localStorage.setItem('user', JSON.stringify(newUser));
                setIsLoading(false);
                return true;
            }

            setIsLoading(false);
            return false;
        } catch (error) {
            console.error('Login error', error);
            setIsLoading(false);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider; 