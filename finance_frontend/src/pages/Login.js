    import React, { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { useAuth } from '../context/AuthContext';
    import './Login.css';

    const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password);
        
        if (result.success) {
        navigate('/dashboard');
        } else {
        setError(result.error);
        }
        
        setLoading(false);
    };

    return (
        <div className="login-container">
        <div className="login-card">
            <div className="login-header">
            <h1>💰 Finance Tracker</h1>
            <p>Track your expenses and manage your budget</p>
            </div>
            
            <form onSubmit={handleSubmit}>
            {error && (
                <div className="error-message">
                {error}
                </div>
            )}
            
            <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                />
            </div>
            
            <button 
                type="submit" 
                className="btn-login"
                disabled={loading}
            >
                {loading ? 'Logging in...' : 'Login'}
            </button>
            </form>
            
            <div className="login-footer">
            <p>Use your Django superuser credentials to login</p>
            </div>
        </div>
        </div>
    );
    };

    export default Login;
