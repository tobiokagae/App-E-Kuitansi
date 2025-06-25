// File: Sidebar.js

import { NavLink, Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import React from "react";

import "./Sidebar.css";
import kwitansiIcon from "./assets/daftar_kwitansi.png";
import userIcon from "./assets/user.png";
import logOutIcon from "./assets/logout_white_symbol.png";

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = async (e) => {
    // Tambahkan 'async' di sini
    e.preventDefault();

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
            Swal.showLoading();
            const b = Swal.getHtmlContainer().querySelector("b");
            if (b) {
              timerInterval = setInterval(() => {
                const timeLeft = Swal.getTimerLeft();
                b.textContent = Math.ceil(timeLeft / 1000);
              }, 100);
            }
          },
          willClose: () => {
            clearInterval(timerInterval);
          },
        }).then((countdownResult) => {
          // Gunakan nama variabel berbeda untuk hasil SweetAlert kedua
          /* Read more about handling dismissals below */
          if (countdownResult.dismiss === Swal.DismissReason.timer) {
            console.log("Logout confirmation was closed by the timer");
          }

          // Setelah SweetAlert progress bar selesai, baru lakukan logout
          if (onLogout) {
            onLogout();
          } else {
            // Fallback jika prop onLogout tidak diberikan
            localStorage.removeItem("token");
            localStorage.removeItem("userRole");
            localStorage.removeItem("userName");
            localStorage.removeItem("userEmailNik");
            localStorage.removeItem("userId"); // Pastikan userId juga dihapus
            navigate("/");
          }
        });
      }
    });
  };

  return (
    <div className="sidebar">
      <h2>ADMIN PANEL</h2>
      <ul>
        <li>
          <NavLink to="/admin-dashboard/kuitansi">
            <img
              src={kwitansiIcon}
              alt="Daftar Kwitansi Icon"
              className="icon"
            />
            <span>Daftar Kuitansi</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin-dashboard/pengguna">
            <img src={userIcon} alt="User Icon" className="icon" />
            <span>Daftar Pengguna</span>
          </NavLink>
        </li>
      </ul>

      {/* Tombol Logout tetap sebagai Link, ditambahkan onClick handler */}
      <Link to="/" className="logout" onClick={handleLogoutClick}>
        {" "}
        <img src={logOutIcon} alt="Icon Log Out" className="icon" />
        <span>Keluar</span>
      </Link>
    </div>
  );
}
