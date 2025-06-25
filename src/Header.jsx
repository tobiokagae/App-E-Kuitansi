import React from 'react';
import './Header.css';
import { Link, useNavigate } from 'react-router-dom'; // Pastikan Link di-import

// Asumsikan Anda punya ikon logout di path ini, silakan ganti jika perlu
import logoutIcon from './assets/logout_red_symbol.png'; 

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = (event) => {
    // event.preventDefault() mencegah Link berpindah halaman sebelum logika logout selesai
    // Ini berguna jika Anda perlu membersihkan token, dll.
    event.preventDefault(); 
    
    console.log('Pengguna telah logout.');
    // Setelah semua logika logout selesai, baru arahkan ke halaman login
    navigate('/'); 
  };

  return (
    <header className="header-container">
      <h1 className="header-title">E-Kuitansi</h1>
      
      <div className="user-actions-wrapper">
        <div className="user-bubble">
          <div className="user-info">
            <div className="user-name">Nanda Pratama</div>
            <div className="user-role">Officer 3 Sales Operation</div>
          </div>
        </div>
        
        {/* === INI BAGIAN YANG DIPERBAIKI TOTAL === */}
        {/* Menggunakan komponen Link agar menjadi tag <a>, bukan button */}
        <Link to="/" className="logout-link" onClick={handleLogout}>
          <img src={logoutIcon} alt="Logout" className="logout-icon" />
        </Link>
        {/* === AKHIR PERBAIKAN === */}

      </div>
    </header>
  );
};

export default Header;