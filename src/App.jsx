import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import NandaDashboard from './NandaDashboard';
import AdminDashboardKuitansi from './AdminDashboard'; // ← tambahkan ini
import DaftarPengguna from './DaftarPengguna';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/NandaDashboard" element={<NandaDashboard/>} />
        <Route path="AdminDashboard/DaftarKuitansi" element={<AdminDashboardKuitansi />} />
        <Route path="AdminDashboard/DaftarPengguna" element={<DaftarPengguna />} />
      </Routes>
    </Router>
  );
}

export default App;