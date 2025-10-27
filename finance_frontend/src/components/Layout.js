import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };
return (
    <div className="layout">
    <nav className="navbar">
        <div className="nav-container">
        <div className="nav-brand">
            <h2>💰 Finance Tracker</h2>
        </div>
        <div className="nav-links">
            <Link to="/dashboard" className={isActive('/dashboard')}>
            Dashboard
            </Link>
            <Link to="/transactions" className={isActive('/transactions')}>
            Transactions
            </Link>
            <Link to="/categories" className={isActive('/categories')}>
            Categories
            </Link>
            <Link to="/budgets" className={isActive('/budgets')}>
            Budgets
            </Link>
        </div>
        <button onClick={handleLogout} className="btn-logout">
            Logout
        </button>
        </div>
    </nav>
    <main className="main-content">
        <div className="container">
        <Outlet />
        </div>
        </main>
    </div>
    );
};

export default Layout;