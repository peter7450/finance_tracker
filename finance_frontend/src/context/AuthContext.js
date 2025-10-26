import React , {createContext, useState, useContext, useEfffect} from 'react';
import { authAPI } from './utils/api';

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
    //check if user is logged on
    useEffext (() => {
        const token = localStorage.getItem('access_token');
        if(token){
            setUser({ token });
        }
        setLoading(false);

    }, []);

    const login = async (username, password) => {
        try{
            const data = await authAPI.login(username, password);
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data_refresh);
            setUser({ token: data_access });
            return { success: true }
        }catch (error){
            return{
                success : false,
                error : error.response?.data?.detail || 'Login Failed',
            };
        }
    };
    const logout =  () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('remove_token');
        setUser(null)
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticate : !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};