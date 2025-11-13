import React from 'react';
import { Navigate } from 'react-router-dom';

// ProtectedRoute component to check if user is logged in
const ProtectedRoute = ({ element: Component, ...rest }) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    return (
        isLoggedIn === 'true' ? <Component {...rest} /> : <Navigate to="/" />
    );
};

export default ProtectedRoute;
