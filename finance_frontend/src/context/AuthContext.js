    import React, { createContext, useState, useContext, useEffect } from 'react';
    import { authAPI } from '../utils/api';

    const AuthContext = createContext();

    export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
    };

    export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
        // In a real app, you'd validate the token or fetch user data
        setUser({ token });
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
        const data = await authAPI.login(username, password);
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        setUser({ token: data.access });
        return { success: true };
        } catch (error) {
        return {
            success: false,
            error: error.response?.data?.detail || 'Login failed',
        };
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    };
