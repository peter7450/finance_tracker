    import React, { useState, useEffect } from 'react';
    import { transactionAPI, budgetAPI } from '../utils/api';
    import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
    import './Dashboard.css';

    const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
        setLoading(true);
        const [summaryRes, budgetsRes] = await Promise.all([
            transactionAPI.getSummary(),
            budgetAPI.getCurrentMonth(),
        ]);
        
        setSummary(summaryRes.data);
        setBudgets(budgetsRes.data);
        } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
        } finally {
        setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    // Format category breakdown for pie chart
    const categoryData = summary?.category_breakdown || [];

    // Format budgets for bar chart
    const budgetData = budgets.map(budget => ({
        name: budget.category_name,
        spent: budget.spent_amount,
        limit: budget.monthly_limit,
    }));

    return (
        <div className="dashboard">
        <h1>Dashboard</h1>
        
        {/* Summary Cards */}
        <div className="summary-cards">
            <div className="card summary-card income">
            <div className="card-icon">💰</div>
            <div className="card-content">
                <h3>Total Income</h3>
                <p className="amount">${summary?.total_income?.toFixed(2) || '0.00'}</p>
            </div>
            </div>
            
            <div className="card summary-card expense">
            <div className="card-icon">💸</div>
            <div className="card-content">
                <h3>Total Expenses</h3>
                <p className="amount">${summary?.total_expenses?.toFixed(2) || '0.00'}</p>
            </div>
            </div>
            
            <div className="card summary-card balance">
            <div className="card-icon">💵</div>
            <div className="card-content">
                <h3>Balance</h3>
                <p className={`amount ${summary?.balance >= 0 ? 'positive' : 'negative'}`}>
                ${summary?.balance?.toFixed(2) || '0.00'}
                </p>
            </div>
            </div>
            
            <div className="card summary-card transactions">
            <div className="card-icon">📊</div>
            <div className="card-content">
                <h3>Transactions</h3>
                <p className="amount">{summary?.transaction_count || 0}</p>
            </div>
            </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
            {/* Spending by Category - Pie Chart */}
            <div className="card chart-card">
            <h2>Spending by Category</h2>
            {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category__name, total }) => `${category__name}: $${parseFloat(total).toFixed(0)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                    >
                    {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.category__color || COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${parseFloat(value).toFixed(2)}`} />
                    <Legend />
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <p className="no-data">No expense data available</p>
            )}
            </div>

            {/* Budget Overview - Bar Chart */}
            <div className="card chart-card">
            <h2>Budget Overview (Current Month)</h2>
            {budgetData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="spent" fill="#ef4444" name="Spent" />
                    <Bar dataKey="limit" fill="#10b981" name="Limit" />
                </BarChart>
                </ResponsiveContainer>
            ) : (
                <p className="no-data">No budget data for current month</p>
            )}
            </div>
        </div>

        {/* Budget Status Cards */}
        {budgets.length > 0 && (
            <div className="budget-status">
            <h2>Budget Status</h2>
            <div className="budget-cards">
                {budgets.map((budget) => {
                const percentage = (budget.spent_amount / budget.monthly_limit) * 100;
                const isOverBudget = budget.is_over_budget;
                
                return (
                    <div key={budget.id} className={`card budget-card ${isOverBudget ? 'over-budget' : ''}`}>
                    <h3>{budget.category_name}</h3>
                    <div className="budget-info">
                        <div className="budget-amounts">
                        <span className="spent">${budget.spent_amount.toFixed(2)}</span>
                        <span className="separator">/</span>
                        <span className="limit">${budget.monthly_limit.toFixed(2)}</span>
                        </div>
                        <div className="budget-progress">
                        <div 
                            className="progress-bar"
                            style={{ 
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: isOverBudget ? '#ef4444' : '#10b981'
                            }}
                        />
                        </div>
                        <p className="remaining">
                        {isOverBudget 
                            ? `Over budget by $${Math.abs(budget.remaining).toFixed(2)}`
                            : `$${budget.remaining.toFixed(2)} remaining`
                        }
                        </p>
                    </div>
                    </div>
                );
                })}
            </div>
            </div>
        )}
        </div>
    );
    };

    export default Dashboard;
