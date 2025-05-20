'use client';

import React, {
    createContext,
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<UserData | null>(null);



    useEffect(() => {
        const token = localStorage.getItem('token');
        const userDataStr = localStorage.getItem('user');

        if (token && userDataStr) {
            setIsLoggedIn(true);
            setUser(JSON.parse(userDataStr));
        } else {
            setIsLoggedIn(false);
            setUser(null);
        }
        setIsLoading(false);
    }, [isLoggedIn]);

    const login = (userData: UserData) => {
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsLoggedIn(true);
    };

    const logout = async () => {
        try {
            const messaging = getMessaging(app);
            await deleteToken(messaging);
            console.log('FCM token deleted');
        } catch (e) {
            console.error('Failed to delete FCM token', e);
        }

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsLoggedIn(false);


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
