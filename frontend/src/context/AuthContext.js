import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode'; // corrected import
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Logout function
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        delete api.defaults.headers.common['Authorization'];
    }, []);

    // Fetch user profile and validate token
    const fetchAndUpdateUser = useCallback(async () => {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) {
            setLoading(false);
            return;
        }

        try {
            const decoded = jwtDecode(currentToken); // ✅ use named import

            // Check if token is expired
            if (decoded.exp * 1000 < Date.now()) {
                console.warn("Token expired, logging out...");
                logout();
                return;
            }

            // Set default authorization header
            api.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;

            // Fetch user profile
            const { data } = await api.get('/users/profile');
            setUser(data);
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
            logout();
        } finally {
            setLoading(false);
        }
    }, [logout]);

    // Fetch profile whenever token changes
    useEffect(() => {
        fetchAndUpdateUser();
    }, [token, fetchAndUpdateUser]);

    // Login function
    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken); // triggers fetchAndUpdateUser
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, fetchAndUpdateUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
