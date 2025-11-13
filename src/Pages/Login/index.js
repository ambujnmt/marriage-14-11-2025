import React, { useState, useEffect } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn === 'true') {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        const loginData = { email, password };

        try {
            const response = await axios.post('https://site2demo.in/marriageapp/api/login', loginData);

            if (response.data.status === true) {
                const userId = response.data.user.id;
                const token = response.data.token;
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('user_id', userId);
                localStorage.setItem('auth_token', token);

                onLogin && onLogin();
                toast.success('Login Successful!', { position: 'top-right', autoClose: 3000 });
                navigate('/dashboard');
            } else {
                const apiMessage = response.data.message || 'Login Failed! Please try again.';
                setErrorMessage(apiMessage);
                toast.error(apiMessage, { position: 'top-right', autoClose: 3000 });
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Login Failed! Please check credentials.';
            setErrorMessage(errorMsg);
            toast.error(errorMsg, { position: 'top-right', autoClose: 3000 });
            console.error('Login Error:', error.response || error.message);
        }
    };

    const togglePassword = () => setShowPassword(!showPassword);

    return (
        <div className="login-container">
            <div className="login-card shadow">
                <h3 className="text-center mb-3 text-gradient">💍 Admin Login</h3>
                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-control"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <div className="input-group">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-control"
                                placeholder="Enter your password"
                                required
                            />
                            <span className="input-group-text" onClick={togglePassword}>
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </span>
                        </div>
                    </div>

                    <div className="d-grid">
                        <button type="submit" className="btn btn-pink">Login</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
