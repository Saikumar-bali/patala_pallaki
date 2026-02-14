import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

interface User {
    id: number;
    email: string;
    name?: string;
    avatarUrl?: string;
    role: 'CUSTOMER' | 'ADMIN';
}

export interface AuthContextType {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
    isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Here we would typically check if the user is already logged in 
        // by making a call to an endpoint like /api/auth/me
        // For this MVP, we'll rely on the user logging in again or persisting state locally if needed
        // But since we use httponly cookies, we can't read the token JS side.
        // Best practice is a /me endpoint. We haven't built it yet, but let's assume valid session for now if we had one.
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed on server', error);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('cart');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

/* useAuth hook is moved to src/hooks/useAuth.ts */
