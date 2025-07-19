import { createContext } from 'react';
import { UserResponseData } from '../../api/generated';

export interface AuthContextType {
    // Initialized
    initialized: boolean;

    // User
    user: UserResponseData | null;
    setUser: (user: UserResponseData | null) => void;

    // Token
    token: string | null;
    setToken: (token: string | null) => void;

    // Methods
    logout: (isLogoutAll: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext; 