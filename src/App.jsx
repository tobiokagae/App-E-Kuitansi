// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import OfficerDashboard from "./OfficerDashboard";
import IseDashboard from "./ISEDashboard";
import AdminDashboardKuitansi from "./AdminDashboard";
import DaftarKuitansi from "./DaftarKuitansi";
import DaftarPengguna from "./DaftarPengguna";
import ProtectedRoute from "./ProtectedRoute";
import LoadingProgressBar from "./LoadingProgressBar"; // Import the new component

function App() {
  return (
    <Router>
      <LoadingProgressBar /> {/* Add the progress bar component here */}
      <Routes>
        {/* Rute Login (tidak dilindungi) */}
        <Route path="/" element={<Login />} />

        {/* --- Rute yang dilindungi berdasarkan peran --- */}

        {/* Rute untuk Officer Dashboard (hanya untuk peran 'off3so') */}
        <Route element={<ProtectedRoute allowedRoles={["off3so"]} />}>
          <Route path="/officer-dashboard" element={<OfficerDashboard />} />
        </Route>

        {/* Rute untuk ISE Dashboard (hanya untuk peran 'ISE') */}
        <Route element={<ProtectedRoute allowedRoles={["ISE"]} />}>
          <Route path="/ise-dashboard" element={<IseDashboard />} />
        </Route>

        {/* Rute untuk Admin Dashboard (hanya untuk peran 'admin') */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin-dashboard" element={<AdminDashboardKuitansi />}>
            {/* Rute anak di bawah AdminDashboard juga dilindungi oleh parent ProtectedRoute */}
            <Route path="kuitansi" element={<DaftarKuitansi />} />
            <Route path="pengguna" element={<DaftarPengguna />} />
          </Route>
        </Route>

        {/* --- AKHIR BAGIAN Rute yang dilindungi --- */}

        {/* Opsional: Rute untuk halaman Not Found (404) */}
        {/* <Route path="*" element={<div>404 Not Found</div>} /> */}
      </Routes>
    </Router>
  );
}

export default App;
