import Sidebar from './Sidebar';
import DaftarKuitansi from './DaftarKuitansi';
import './AdminDashboard.css';

export default function AdminDashboard() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <DaftarKuitansi />
      </div>
    </div>
  );
}
