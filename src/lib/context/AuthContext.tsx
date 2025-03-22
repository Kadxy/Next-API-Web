import { createContext } from 'react';

export interface ContextUser {
    uid: string;
    displayName: string;
    avatar: string;
}

interface AuthContextType {
    // Loading
    isLoading: boolean;

    // User
    user: ContextUser | null;
    setUser: (user: ContextUser | null) => void;

    // Token
    token: string | null;
    setToken: (token: string | null) => void;

    // Methods
    logout: (isLogoutAll: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext; 