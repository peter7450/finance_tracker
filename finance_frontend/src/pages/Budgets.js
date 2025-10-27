    import React, { useState, useEffect } from 'react';
    import { budgetAPI, categoryAPI } from '../utils/api';
    import './Budgets.css';

    const Budgets = () => {
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        category: '',
        monthly_limit: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
        const [budgetsRes, categoriesRes] = await Promise.all([
            budgetAPI.getCurrentMonth(),
            categoryAPI.getAll()
        ]);
        setBudgets(budgetsRes.data);
        setCategories(categoriesRes.data);
        } catch (error) {
        console.error('Error fetching data:', error);
        } finally {
        setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        await budgetAPI.create(formData);
        setShowForm(false);
        setFormData({
            category: '',
            monthly_limit: '',
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
        });
        fetchData();
        } catch (error) {
        console.error('Error creating budget:', error);
        alert('Failed to create budget');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this budget?')) {
        try {
            await budgetAPI.delete(id);
            fetchData();
        } catch (error) {
            console.error('Error deleting budget:', error);
        }
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="budgets-page">
        <div className="page-header">
            <h1>Budgets</h1>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : '+ Set Budget'}
            </button>
        </div>

        {showForm && (
            <div className="card">
            <h2>Set New Budget</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                <div className="form-group">
                    <label>Category</label>
                    <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                    >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Monthly Limit</label>
                    <input
                    type="number"
                    step="0.01"
                    value={formData.monthly_limit}
                    onChange={(e) => setFormData({...formData, monthly_limit: e.target.value})}
                    placeholder="500.00"
                    required
                    />
                </div>
                </div>
                <button type="submit" className="btn-success">Save Budget</button>
            </form>
            </div>
        )}

        <div className="card">
            <h2>Current Month Budgets</h2>
            {budgets.length === 0 ? (
            <p>No budgets set for this month. Create one above!</p>
            ) : (
            <div className="budgets-grid">
                {budgets.map(budget => {
                const percentage = (budget.spent_amount / budget.monthly_limit) * 100;
                return (
                    <div key={budget.id} className={`budget-card ${budget.is_over_budget ? 'over-budget' : ''}`}>
                    <div className="budget-header">
                        <h3>{budget.category_name}</h3>
                        <button 
                        onClick={() => handleDelete(budget.id)}
                        className="btn-danger btn-small"
                        >
                        Delete
                        </button>
                    </div>
                    <div className="budget-amounts">
                        <span className="spent">${budget.spent_amount.toFixed(2)}</span>
                        <span className="separator">/</span>
                        <span className="limit">${budget.monthly_limit.toFixed(2)}</span>
                    </div>
                    <div className="progress-bar-container">
                        <div 
                        className="progress-bar"
                        style={{ 
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: budget.is_over_budget ? '#ef4444' : '#10b981'
                        }}
                        />
                    </div>
                    <p className="remaining">
                        {budget.is_over_budget 
                        ? `Over budget by $${Math.abs(budget.remaining).toFixed(2)}`
                        : `$${budget.remaining.toFixed(2)} remaining`
                        }
                    </p>
                    </div>
                );
                })}
            </div>
            )}
        </div>
        </div>
    );
    };

    export default Budgets;