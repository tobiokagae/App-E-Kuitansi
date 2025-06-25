import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import NandaDashboard from './NandaDashboard';
import IseDashboard from './ISEDashboard'; // Import IseDashboard
import AdminDashboardKuitansi from './AdminDashboard'; // Ini adalah Layout kita
import DaftarKuitansi from './DaftarKuitansi';
import DaftarPengguna from './DaftarPengguna';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute yang berdiri sendiri */}
        <Route path="/" element={<Login />} />
        <Route path="/NandaDashboard" element={<NandaDashboard />} />
        {/* IseDashboard berdiri sendiri, di level yang sama dengan NandaDashboard */}
        <Route path="/IseDashboard" element={<IseDashboard />} /> 

        {/* --- BAGIAN ADMIN DASHBOARD DENGAN LAYOUTNYA --- */}
        <Route path="/AdminDashboard" element={<AdminDashboardKuitansi />}>
          {/* Rute anak di bawah AdminDashboard */}
          <Route path="DaftarKuitansi" element={<DaftarKuitansi />} />
          <Route path="DaftarPengguna" element={<DaftarPengguna />} />
        </Route>
        {/* --- AKHIR BAGIAN ADMIN DASHBOARD --- */}

      </Routes>
    </Router>
  );
}

export default App;