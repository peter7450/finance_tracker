    import React, { useState, useEffect } from 'react';
    import { categoryAPI } from '../utils/api';
    import './Categories.css';

    const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        color: '#3b82f6'
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
        const response = await categoryAPI.getAll();
        setCategories(response.data);
        } catch (error) {
        console.error('Error fetching categories:', error);
        } finally {
        setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        await categoryAPI.create(formData);
        setShowForm(false);
        setFormData({ name: '', color: '#3b82f6' });
        fetchCategories();
        } catch (error) {
        console.error('Error creating category:', error);
        alert('Failed to create category');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This will affect all transactions using this category.')) {
        try {
            await categoryAPI.delete(id);
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
        }
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="categories-page">
        <div className="page-header">
            <h1>Categories</h1>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : '+ Add Category'}
            </button>
        </div>

        {showForm && (
            <div className="card">
            <h2>Add New Category</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                <label>Category Name</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Food, Transport, Entertainment"
                    required
                />
                </div>
                <div className="form-group">
                <label>Color</label>
                <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                />
                </div>
                <button type="submit" className="btn-success">Save Category</button>
            </form>
            </div>
        )}

        <div className="card">
            <h2>All Categories</h2>
            {categories.length === 0 ? (
            <p>No categories yet. Create your first category above!</p>
            ) : (
            <div className="categories-grid">
                {categories.map(category => (
                <div key={category.id} className="category-card">
                    <div className="category-header">
                    <div className="category-info">
                        <div 
                        className="color-box" 
                        style={{backgroundColor: category.color}}
                        />
                        <h3>{category.name}</h3>
                    </div>
                    <button 
                        onClick={() => handleDelete(category.id)}
                        className="btn-danger btn-small"
                    >
                        Delete
                    </button>
                    </div>
                    <p className="transaction-count">
                    {category.transaction_count} transaction{category.transaction_count !== 1 ? 's' : ''}
                    </p>
                </div>
                ))}
            </div>
            )}
        </div>
        </div>
    );
    };

    export default Categories;