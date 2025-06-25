// File: Sidebar.js

import { NavLink, Link } from 'react-router-dom'; // 1. Import NavLink
import './Sidebar.css';
import kwitansiIcon from './assets/daftar_kwitansi.png';
import userIcon from './assets/user.png';
import logOutIcon from './assets/logout_white_symbol.png';

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2>ADMIN PANEL</h2>
      <ul>
        {/* 2. Hapus className="active" dari <li> */}
        <li>
          {/* 3. Ganti <Link> menjadi <NavLink> */}
          <NavLink to="/AdminDashboard/DaftarKuitansi">
            <img src={kwitansiIcon} alt="Daftar Kwitansi Icon" className="icon" />
            <span>Daftar Kuitansi</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/AdminDashboard/DaftarPengguna">
            <img src={userIcon} alt="User Icon" className="icon" />
            <span>Daftar Pengguna</span>
          </NavLink>
        </li>
      </ul>
      {/* --- UBAH BAGIAN INI --- */}
      <Link to="/" className="logout"> {/* Pindahkan className ke sini dan hapus div */}
        <img src={logOutIcon} alt="Icon Log Out" className="icon" />
        <span>Keluar</span>
      </Link>
      {/* --- AKHIR PERUBAHAN --- */}
    </div>
  );
}