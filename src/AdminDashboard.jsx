// File: AdminDashboard.js

import { Outlet } from 'react-router-dom'; // 1. Ganti import
import Sidebar from './Sidebar';
import './AdminDashboard.css';

export default function AdminDashboard() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        {/* 2. Ganti komponen statis dengan Outlet dari react-router-dom */}
        <Outlet /> 
      </div>
    </div>
  );
}