import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions';
import  Categories from './pages/Categories';
import Budget from './pages/Budgets';
import Layout from './components/Layout';
import './App.css';

function App(){
  return(
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
          path = "/"
          element={
            <ProtectedRoute>
              <Layout/>
            </ProtectedRoute>
          }
          >
            <Route index element={<Navigate to ="/dashboard" replace />} />
            <Route path="dashboard" element ={<Dashboard />} />
            <Route path="transaction" element={<transactions />} />
            <Route path="categories" element={<Categories />} />
            <Route path="budgets" element={<budgets />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;