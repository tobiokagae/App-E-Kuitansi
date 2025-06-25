import React, { useState, useEffect, useRef } from "react";
import Header from "./Header";
import Swal from "sweetalert2";

import "./OfficerDashboard.css"; // Pastikan file CSS ini ada

import buttonDelete from "./assets/button_delete.png";
import buttonDownload from "./assets/button_download.png";
import buttonNext from "./assets/next-button.png";
import buttonPrevious from "./assets/previous-button.png";
import searchIcon from "./assets/search_icon.png";
import calendarIcon from "./assets/calendar_icon.png";
import dropdownIcon from "./assets/dropdown_icon.png";

const API_BASE_URL = "http://localhost:5000";

export default function OfficerDashboard() {
  const [kuitansiList, setKuitansiList] = useState([]);
  const [filteredKuitansi, setFilteredKuitansi] = useState([]);
  const [users, setUsers] = useState([]); // Untuk dropdown ISE
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(""); // Menggunakan ID user untuk filter

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dateRef = useRef(null);

  const userRole = localStorage.getItem("userRole"); // Ambil role pengguna dari localStorage
  const currentUserId = parseInt(localStorage.getItem("userId"), 10); // Ambil ID pengguna saat ini

  // Fungsi untuk mengambil token dari localStorage
  const getToken = () => localStorage.getItem("token");

  // Helper untuk menampilkan SweetAlert dengan timerProgressBar
  const showTimedSwal = async (options) => {
    let timerInterval;
    await Swal.fire({
      showConfirmButton: false,
      timerProgressBar: true,
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
      ...options, // Gabungkan opsi yang diberikan
    });
  };

  // Fungsi untuk mengambil daftar kuitansi dari backend
  const fetchKuitansi = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/kuitansi/all_kuitansi`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setKuitansiList(data.data);
      } else {
        throw new Error(data.message || "Gagal mengambil data kuitansi.");
      }
    } catch (err) {
      console.error("Error fetching kuitansi:", err);
      const errorMessage = "Gagal memuat data kuitansi: " + err.message;
      setError(errorMessage);
      Swal.fire({
        // Menggunakan Swal.fire langsung untuk error fetch awal
        icon: "error",
        title: "Terjadi Kesalahan", // Judul error Bahasa Indonesia
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mengambil daftar pengguna (untuk dropdown ISE)
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/get_users`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.data); // Store all users
      } else {
        throw new Error(data.message || "Gagal mengambil data pengguna.");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      // Tidak perlu Swal.fire di sini karena ini adalah fetch sekunder, error utamanya di kuitansi
    }
  };

  useEffect(() => {
    fetchKuitansi();
    fetchUsers(); // Ambil daftar pengguna saat komponen dimuat
  }, []);

  // Fungsi filtering kuitansi (client-side)
  useEffect(() => {
    let tempKuitansi = [...kuitansiList];

    // Filter berdasarkan search term (nama pelanggan, nomor kuitansi, deskripsi)
    if (searchTerm) {
      tempKuitansi = tempKuitansi.filter(
        (kuitansi) =>
          kuitansi.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(kuitansi.nomor_kuitansi)
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          kuitansi.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter berdasarkan tanggal
    if (selectedDate) {
      tempKuitansi = tempKuitansi.filter((kuitansi) => {
        // Asumsi format tanggal di data:YYYY-MM-DD
        const kuitansiDate = new Date(kuitansi.tanggal)
          .toISOString()
          .split("T")[0];
        return kuitansiDate === selectedDate;
      });
    }

    // Filter berdasarkan ISE (id_user)
    if (selectedUserId) {
      // Ensure selectedUserId is compared correctly as a number if id_user is number
      tempKuitansi = tempKuitansi.filter(
        (kuitansi) => kuitansi.id_user === parseInt(selectedUserId, 10)
      );
    }

    setFilteredKuitansi(tempKuitansi);
    setCurrentPage(1); // Reset halaman ke 1 setelah filter
  }, [kuitansiList, searchTerm, selectedDate, selectedUserId]);

  const totalPages = Math.ceil(filteredKuitansi.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredKuitansi.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const handleSelectUser = (id) => {
    setSelectedUserId(id);
    setIsDropdownOpen(false);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };
  const handleRowsChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10)); // Pastikan parse ke integer
    setCurrentPage(1);
  };

  const handleDownload = async (kuitansiId, nomorKuitansi) => {
    // Hanya admin dan off3so yang bisa download
    if (userRole !== "admin" && userRole !== "off3so") {
      Swal.fire(
        "Akses Ditolak",
        "Anda tidak memiliki izin untuk mengunduh kuitansi.",
        "warning"
      );
      return;
    }

    Swal.fire({
      title: "Konfirmasi Unduh", // Bahasa Indonesia
      text: "Anda yakin ingin mengunduh kuitansi ini?", // Bahasa Indonesia
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Unduh!", // Bahasa Indonesia
      cancelButtonText: "Batal", // Bahasa Indonesia
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/kuitansi/cetak_pdf/${kuitansiId}`,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            }
          );

          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `kuitansi_${nomorKuitansi}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            await showTimedSwal({
              icon: "success",
              title: "Berhasil!", // Bahasa Indonesia
              html: "Kuitansi berhasil diunduh. Modal akan menutup dalam <b></b> detik.", // Bahasa Indonesia
              timer: 1500,
            });
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || "Gagal mengunduh kuitansi.");
          }
        } catch (error) {
          console.error("Error downloading kuitansi:", error);
          Swal.fire({
            icon: "error",
            title: "Unduhan Gagal!", // Bahasa Indonesia
            text: `Gagal mengunduh kuitansi: ${error.message}`, // Bahasa Indonesia
          });
        }
      }
    });
  };

  const handleDelete = async (kuitansiId) => {
    // Hanya admin dan off3so yang bisa menghapus
    if (userRole !== "admin" && userRole !== "off3so") {
      Swal.fire(
        "Akses Ditolak",
        "Anda tidak memiliki izin untuk menghapus kuitansi.",
        "warning"
      );
      return;
    }

    Swal.fire({
      title: "Konfirmasi Hapus", // Bahasa Indonesia
      text: "Anda yakin ingin menghapus kuitansi ini? Tindakan ini tidak dapat dibatalkan!", // Bahasa Indonesia
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!", // Bahasa Indonesia
      cancelButtonText: "Batal", // Bahasa Indonesia
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/kuitansi/delete/${kuitansiId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            }
          );
          const data = await response.json();
          if (response.ok) {
            await showTimedSwal({
              icon: "success",
              title: "Berhasil Dihapus!", // Bahasa Indonesia
              html: `${data.message} Modal akan menutup dalam <b></b> detik.`, // Bahasa Indonesia
              timer: 1500,
            });
            fetchKuitansi(); // Ambil ulang data setelah penghapusan
          } else {
            throw new Error(data.message || "Gagal menghapus kuitansi.");
          }
        } catch (error) {
          console.error("Error deleting kuitansi:", error);
          Swal.fire({
            icon: "error",
            title: "Penghapusan Gagal!", // Bahasa Indonesia
            text: `Gagal menghapus kuitansi: ${error.message}`, // Bahasa Indonesia
          });
        }
      }
    });
  };

  // Filter users to get only ISE role for the dropdown
  const iseUsers = users.filter((user) => user.role === "ISE");

  // Untuk mendapatkan nama ISE yang dipilih untuk ditampilkan di strong tag
  const selectedIseDisplayName = selectedUserId
    ? iseUsers.find((u) => u.id_user === parseInt(selectedUserId, 10))?.nama ||
      "Pilih ISE"
    : "Pilih ISE";

  // Render kondisi loading dan error
  if (loading) {
    return (
      <div className="nanda-dashboard-layout">
        <Header />
        <main className="nanda-dashboard-content">
          <p>Memuat data kuitansi...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nanda-dashboard-layout">
        <Header />
        <main className="nanda-dashboard-content">
          <p className="error-message">{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="nanda-dashboard-layout">
      <Header />

      <main className="nanda-dashboard-content">
        <div className="page-actions">
          <div className="filters">
            <div className="input-wrapper">
              <img src={searchIcon} alt="search" />
              <input
                type="text"
                placeholder="Cari berdasarkan nomor, nama, atau deskripsi"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div
              className="input-wrapper"
              onClick={() => dateRef.current?.showPicker()}
            >
              <img
                src={calendarIcon}
                alt="calendar"
                style={{ cursor: "pointer" }}
              />
              <input
                type="date"
                ref={dateRef}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="input-wrapper dropdown" onClick={toggleDropdown}>
              <strong className="selected-ise-text">
                {selectedIseDisplayName}
              </strong>
              <img src={dropdownIcon} alt="dropdown" />
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <p
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectUser(""); // Set ID kosong untuk "Semua ISE"
                    }}
                  >
                    Semua ISE
                  </p>
                  {iseUsers.map((user) => (
                    <p
                      key={user.id_user}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectUser(user.id_user); // Kirim hanya ID
                      }}
                    >
                      {user.nama}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nomor</th>
                <th>Nama Pelanggan</th>
                <th>Tanggal</th>
                <th>Jumlah (Rp)</th>
                <th>Terbilang</th>
                <th>Deskripsi</th>
                <th>Dibuat Oleh</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((data) => {
                  const creatorUser = users.find(
                    (u) => u.id_user === data.id_user
                  );
                  const creatorName = creatorUser
                    ? creatorUser.nama
                    : "Tidak Diketahui";
                  return (
                    <tr key={data.id_kuitansi}>
                      <td>{data.nomor_kuitansi}</td>
                      <td>{data.nama}</td>
                      <td>{data.tanggal}</td>
                      <td>Rp {data.jumlah.toLocaleString("id-ID")}</td>
                      <td>{data.terbilang}</td>
                      <td>{data.deskripsi}</td>
                      <td>{creatorName}</td>
                      <td>
                        {/* Tombol Hapus (hanya untuk admin dan off3so) */}
                        {(userRole === "admin" || userRole === "off3so") && (
                          <button
                            onClick={() => handleDelete(data.id_kuitansi)}
                          >
                            <img
                              src={buttonDelete}
                              alt="Hapus"
                              width={25}
                              height={25}
                            />
                          </button>
                        )}
                        {/* Tombol Download/Cetak PDF (untuk admin, off3so, atau ISE yang membuat kuitansi sendiri) */}
                        {(userRole === "admin" ||
                          userRole === "off3so" ||
                          (userRole === "ISE" &&
                            currentUserId === data.id_user)) && (
                          <button
                            onClick={() =>
                              handleDownload(
                                data.id_kuitansi,
                                data.nomor_kuitansi
                              )
                            }
                          >
                            <img
                              src={buttonDownload}
                              alt="Cetak/Unduh"
                              width={25}
                              height={25}
                            />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Tidak ada data kuitansi yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-container">
          <p className="information">Baris per halaman</p>
          <select
            className="dropdown"
            value={rowsPerPage}
            onChange={handleRowsChange}
          >
            {[10, 20, 30, 40].map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
          <div className="button-page">
            <button
              className="previous-page"
              onClick={handlePrevious}
              disabled={currentPage === 1}
            >
              <img src={buttonPrevious} alt="Previous" />
            </button>
            <p>
              {currentPage} / {totalPages}
            </p>
            <button
              className="next-page"
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              <img src={buttonNext} alt="Next" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
