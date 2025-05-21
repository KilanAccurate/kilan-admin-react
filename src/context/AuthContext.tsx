'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import { deleteToken, getMessaging } from 'firebase/messaging';
import { app } from 'src/lib/firebase';
import { useNavigate } from 'react-router-dom';
import type { SiteLocation } from './GlobalContext';

export type UserData = {
    _id: string
    fullName: string
    position: string
    site: SiteLocation
    department: string
    nik: string
    phone: string
    salary: number
    role: string
    token: string
}


type AuthContextType = {
    isLoggedIn: boolean;
    isLoading: boolean;
    user: UserData | null;
    login: (userData: UserData) => void;
    logout: () => Promise<void>;
};

const parseJwt = (token: string): { exp: number } => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (err) {
        return { exp: 0 };
    }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<UserData | null>(null);


    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            const messaging = getMessaging(app);
            await deleteToken(messaging);
            // // console.log('FCM token deleted');
        } catch (e) {
            // console.error('Failed to delete FCM token', e);
        }

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsLoggedIn(false);
        setIsLoading(false);
    }, []);

    // Listen to global "logout" event triggered from outside React (e.g., Axios interceptor)
    useEffect(() => {
        const onLogout = () => {
            logout();
        };
        window.addEventListener('logout', onLogout);
        return () => window.removeEventListener('logout', onLogout);
    }, [logout]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userDataStr = localStorage.getItem('user');

        if (token && userDataStr) {
            try {
                const decoded = parseJwt(token);
                // // console.log(decoded)
                const isExpired = decoded.exp * 1000 < Date.now();

                if (isExpired) {
                    logout();
                    return;
                }

                setIsLoggedIn(true);
                setUser(JSON.parse(userDataStr));
            } catch (err) {
                // console.error('Invalid token:', err);
                logout();
            }
        } else {
            setIsLoggedIn(false);
            setUser(null);
        }

        setIsLoading(false);
    }, [isLoggedIn]);

    const login = (userData: UserData) => {
        // // console.log(userData.token)
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsLoggedIn(true);
    };

    return (
        <AuthContext.Provider
            value={{ isLoggedIn, isLoading, user, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
