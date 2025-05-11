import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/dashboard/Dashboard'
import LeadsPage from './pages/leads/LeadsPage'
import LeadDetailPage from './pages/leads/LeadDetailPage'
import CustomersPage from './pages/customers/CustomersPage'
import DatabaseStatus from './pages/admin/DatabaseStatus'

import './App.css'

const App: React.FC = () => {
  return (
    <div dir="rtl">
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/leads/:id" element={<LeadDetailPage />} />
        <Route path="/admin/database-status" element={<DatabaseStatus />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </div>
  )
}

export default App 