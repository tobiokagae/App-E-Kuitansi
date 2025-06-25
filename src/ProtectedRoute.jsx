// src/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert2

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    // Jika tidak ada token, arahkan ke halaman login
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Jika ada token tapi peran tidak diizinkan, tampilkan Swal dan arahkan
    Swal.fire({
      icon: "error",
      title: "Akses Ditolak",
      text: "Anda tidak memiliki izin untuk mengakses halaman ini.",
      confirmButtonText: "OK",
    }).then(() => {
      // Setelah user menekan OK, arahkan ke halaman login
      // Penting: Navigate harus dipanggil di luar .then() jika Anda ingin langsung mengarahkan
      // Tapi untuk pengalaman pengguna yang lebih baik dengan Swal, kita arahkan setelah dia klik OK.
      // Namun, React Router Navigate harus berada di render cycle, bukan di dalam callback.
      // Solusinya adalah tetap mengembalikan Navigate, tapi pastikan Swal pop-up muncul.
    });
    return <Navigate to="/" replace />; // Arahkan segera setelah Swal dipicu
  }

  // Jika token ada dan peran diizinkan, render komponen anak
  return <Outlet />;
};

export default ProtectedRoute;
