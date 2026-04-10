import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('siem_token') || null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Setup Axios Interceptor
    useEffect(() => {
        axios.defaults.baseURL = 'http://localhost:8000';
        
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [token]);

    useEffect(() => {
        if (token) {
            checkUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const checkUser = async () => {
        try {
            const res = await axios.get('/api/auth/me');
            setUser(res.data);
        } catch (e) {
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const res = await axios.post('/api/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        const access_token = res.data.access_token;
        setToken(access_token);
        localStorage.setItem('siem_token', access_token);
        return true;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('siem_token');
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
