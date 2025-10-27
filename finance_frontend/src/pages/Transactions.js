
    import React, { useState, useEffect } from 'react';
    import { transactionAPI, categoryAPI } from '../utils/api';
    import './Transactions.css';

    const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        transaction_type: 'expense',
        date: new Date().toISOString().split('T')[0],
        category: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
        const [transRes, catRes] = await Promise.all([
            transactionAPI.getAll(),
            categoryAPI.getAll()
        ]);
        setTransactions(transRes.data);
        setCategories(catRes.data);
        } catch (error) {
        console.error('Error fetching data:', error);
        } finally {
        setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        await transactionAPI.create(formData);
        setShowForm(false);
        setFormData({
            amount: '',
            description: '',
            transaction_type: 'expense',
            date: new Date().toISOString().split('T')[0],
            category: ''
        });
        fetchData();
        } catch (error) {
        console.error('Error creating transaction:', error);
        alert('Failed to create transaction');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
        try {
            await transactionAPI.delete(id);
            fetchData();
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="transactions-page">
        <div className="page-header">
            <h1>Transactions</h1>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : '+ Add Transaction'}
            </button>
        </div>

        {showForm && (
            <div className="card">
            <h2>Add New Transaction</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                <div className="form-group">
                    <label>Amount</label>
                    <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                    />
                </div>
                <div className="form-group">
                    <label>Type</label>
                    <select
                    value={formData.transaction_type}
                    onChange={(e) => setFormData({...formData, transaction_type: e.target.value})}
                    >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    </select>
                </div>
                </div>

                <div className="form-group">
                <label>Description</label>
                <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                />
                </div>

                <div className="form-row">
                <div className="form-group">
                    <label>Category</label>
                    <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                    <option value="">No Category</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Date</label>
                    <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                    />
                </div>
                </div>

                <button type="submit" className="btn-success">Save Transaction</button>
            </form>
            </div>
        )}

        <div className="card">
            <h2>All Transactions</h2>
            {transactions.length === 0 ? (
            <p>No transactions yet. Add your first transaction above!</p>
            ) : (
            <table>
                <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {transactions.map(transaction => (
                    <tr key={transaction.id}>
                    <td>{transaction.date}</td>
                    <td>{transaction.description}</td>
                    <td>
                        {transaction.category_name ? (
                        <span 
                            className="category-badge" 
                            style={{backgroundColor: transaction.category_color}}
                        >
                            {transaction.category_name}
                        </span>
                        ) : '-'}
                    </td>
                    <td>
                        <span className={`type-badge ${transaction.transaction_type}`}>
                        {transaction.transaction_type}
                        </span>
                    </td>
                    <td className={transaction.transaction_type === 'income' ? 'income' : 'expense'}>
                        ${parseFloat(transaction.amount).toFixed(2)}
                    </td>
                    <td>
                        <button 
                        onClick={() => handleDelete(transaction.id)}
                        className="btn-danger btn-small"
                        >
                        Delete
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            )}
        </div>
        </div>
    );
    };

    export default Transactions;