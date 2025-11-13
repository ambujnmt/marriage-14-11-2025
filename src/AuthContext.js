// src/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from "react";

// Create the context
const AuthContext = createContext();

// AuthProvider to wrap around your app
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Check if user ID is saved in localStorage
    useEffect(() => {
        const userId = localStorage.getItem("user_id");
        if (userId) {
            setUser({ id: Number(userId) });
        }
    }, []);

    // Login function: save user_id and set user state
    const login = (id) => {
        localStorage.setItem("user_id", id);
        setUser({ id });
    };

    // Logout function: remove user_id and clear user state
    const logout = () => {
        localStorage.removeItem("user_id");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
