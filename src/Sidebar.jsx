import { Link } from 'react-router-dom'; // ← Tambahkan ini
import './Sidebar.css';
import kwitansiIcon from './assets/daftar_kwitansi.png';
import userIcon from './assets/user.png';
import logOutIcon from './assets/logout_white_symbol.png';

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2>ADMIN PANEL</h2>
      <ul>
        <li className="active">
          <Link to="/AdminDashboard/DaftarKuitansi">
            <img src={kwitansiIcon} alt="Daftar Kwitansi Icon" className="icon" />
            <span>Daftar Kuitansi</span>
          </Link>
        </li>
        <li>
          <Link to="/AdminDashboard/DaftarPengguna">
            <img src={userIcon} alt="User Icon" className="icon" />
            <span>Daftar Pengguna</span>
          </Link>
        </li>
      </ul>
      <div className="logout">
        <Link to="/">
          <img src={logOutIcon} alt="Icon Log Out" className="icon" />
          <span>Keluar</span>
        </Link>
      </div>
    </div>
  );
}
