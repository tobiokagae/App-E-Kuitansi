import React, { useEffect, useState } from "react";
import "./Header.css";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Asumsikan Anda punya ikon logout di path ini, silakan ganti jika perlu
import logoutIcon from "./assets/logout_red_symbol.png";

const Header = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Pengguna"); // State untuk nama pengguna
  const [userRole, setUserRole] = useState("Role"); // State untuk peran pengguna

  // Ambil data pengguna dari localStorage saat komponen dimuat
  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    const storedUserRole = localStorage.getItem("userRole");

    if (storedUserName) {
      setUserName(storedUserName);
    }
    if (storedUserRole) {
      // Anda mungkin ingin memformat role dari backend (misal 'off3so' menjadi 'Officer 3 Sales Operation')
      // Jika backend sudah mengirim dalam format yang mudah dibaca, tidak perlu mapping
      const formattedRole = formatRoleForDisplay(storedUserRole);
      setUserRole(formattedRole);
    }
  }, []); // Array dependensi kosong agar hanya berjalan sekali saat mount

  // Fungsi pembantu untuk memformat role jika diperlukan
  const formatRoleForDisplay = (role) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "ISE":
        return "ISE";
      case "off3so":
        return "Officer 3 Sales Operation";
      default:
        return role; // Kembalikan role asli jika tidak ada mapping
    }
  };

  const handleLogout = async (event) => {
    // Tambahkan 'async' di sini
    event.preventDefault(); // Mencegah Link berpindah halaman sebelum logika logout selesai

    Swal.fire({
      title: "Konfirmasi Logout",
      text: "Anda yakin ingin keluar dari aplikasi?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Keluar!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      // Tambahkan 'async' di sini juga
      if (result.isConfirmed) {
        let timerInterval;
        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          html: "Anda akan keluar dalam <b></b> detik.", // Pesan dengan placeholder untuk hitungan mundur
          timer: 1500, // Durasi SweetAlert muncul (1.5 detik)
          timerProgressBar: true, // Aktifkan progress bar
          showConfirmButton: false, // Sembunyikan tombol konfirmasi
          didOpen: () => {
            Swal.showLoading(); // Tampilkan loading spinner bawaan SweetAlert
            const b = Swal.getHtmlContainer().querySelector("b");
            if (b) {
              // Pastikan elemen 'b' ada sebelum mencoba mengaksesnya
              timerInterval = setInterval(() => {
                const timeLeft = Swal.getTimerLeft();
                b.textContent = Math.ceil(timeLeft / 1000); // Update text with remaining seconds
              }, 100);
            }
          },
          willClose: () => {
            clearInterval(timerInterval); // Bersihkan interval timer
          },
        }).then((countdownResult) => {
          // Gunakan nama variabel yang berbeda untuk hasil SweetAlert kedua
          /* Read more about handling dismissals below */
          if (countdownResult.dismiss === Swal.DismissReason.timer) {
            console.log("Logout confirmation was closed by the timer");
          }

          // Hapus semua item dari localStorage yang berkaitan dengan sesi pengguna
          localStorage.removeItem("token");
          localStorage.removeItem("userRole");
          localStorage.removeItem("userName");
          localStorage.removeItem("userEmailNik");
          localStorage.removeItem("userId"); // Pastikan ID pengguna juga dihapus jika disimpan

          // Setelah SweetAlert progress bar ditutup, baru arahkan ke halaman login
          navigate("/");
        });
      }
    });
  };

  return (
    <header className="header-container">
      <h1 className="header-title">E-Kuitansi</h1>

      <div className="user-actions-wrapper">
        <div className="user-bubble">
          <div className="user-info">
            <div className="user-name">{userName}</div>
            <div className="user-role">{userRole}</div>
          </div>
        </div>

        {/* Menggunakan komponen Link agar menjadi tag <a>, bukan button */}
        {/* Menambahkan onClick={handleLogout} untuk memicu fungsi logout */}
        <Link to="/" className="logout-link" onClick={handleLogout}>
          <img src={logoutIcon} alt="Logout" className="logout-icon" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
