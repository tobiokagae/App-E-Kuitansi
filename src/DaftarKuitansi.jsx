import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2"; // Import SweetAlert2

import "./DaftarKuitansi.css";

import searchIcon from "./assets/search_icon.png";
import calendarIcon from "./assets/calendar_icon.png";
import dropdownIcon from "./assets/dropdown_icon.png";
import buttonDelete from "./assets/button_delete.png";
import buttonDownload from "./assets/button_download.png";
import buttonNext from "./assets/next-button.png";
import buttonPrevious from "./assets/previous-button.png";

const API_BASE_URL = "http://localhost:5000"; // Sesuaikan jika backend Anda berjalan di port atau host lain

export default function DaftarKuitansi() {
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
      setError("Gagal memuat data kuitansi: " + err.message);
      Swal.fire("Error", "Gagal memuat data kuitansi: " + err.message, "error");
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
      // Tidak perlu Swal.fire di sini karena ini adalah fetch sekunder
    }
  };

  useEffect(() => {
    fetchKuitansi();
    fetchUsers(); // Ambil daftar pengguna saat komponen dimuat
  }, []);

  // Fungsi filtering kuitansi
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
      // Hanya filter jika selectedUserId memiliki nilai (bukan string kosong untuk "Semua ISE")
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

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleRowsChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10)); // Pastikan parse ke integer
    setCurrentPage(1);
  };

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  // Mengubah ini untuk menyimpan ID user, bukan nama
  const handleSelectUser = (id) => {
    // Cukup ambil id, nama bisa dicari nanti untuk tampilan
    setSelectedUserId(id);
    setIsDropdownOpen(false);
  };

  const handleDownload = async (kuitansiId, nomorKuitansi) => {
    Swal.fire({
      title: "Konfirmasi Download",
      text: "Anda yakin ingin mengunduh kuitansi ini?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Unduh!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      // Tambahkan 'async' di sini
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

            // Tampilkan SweetAlert dengan progress bar setelah download berhasil
            let timerInterval;
            await Swal.fire({
              icon: "success",
              title: "Berhasil!",
              html: "Kuitansi berhasil diunduh. Modal akan menutup dalam <b></b> detik.", // Pesan dengan placeholder hitungan mundur
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
            }); // .then() kosong karena tidak ada aksi lanjutan setelah SweetAlert ini
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || "Gagal mengunduh kuitansi.");
          }
        } catch (error) {
          console.error("Error downloading kuitansi:", error);
          Swal.fire(
            "Error",
            `Gagal mengunduh kuitansi: ${error.message}`,
            "error"
          );
        }
      }
    });
  };

  const handleDelete = async (kuitansiId) => {
    // Periksa peran pengguna sebelum menampilkan konfirmasi
    if (userRole !== "admin" && userRole !== "off3so") {
      Swal.fire(
        "Akses Ditolak",
        "Anda tidak memiliki izin untuk menghapus kuitansi.",
        "warning"
      );
      return;
    }

    Swal.fire({
      title: "Konfirmasi Hapus",
      text: "Anda yakin ingin menghapus kuitansi ini? Tindakan ini tidak dapat dibatalkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      // Tambahkan 'async' di sini
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
            // Tampilkan SweetAlert dengan progress bar setelah penghapusan berhasil
            let timerInterval;
            await Swal.fire({
              icon: "success",
              title: "Dihapus!",
              html: `${data.message} Modal akan menutup dalam <b></b> detik.`, // Pesan dari backend dengan placeholder hitungan mundur
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
            }); // .then() kosong karena fetchKuitansi() akan dipanggil setelahnya

            fetchKuitansi(); // Ambil ulang data setelah penghapusan
          } else {
            throw new Error(data.message || "Gagal menghapus kuitansi.");
          }
        } catch (error) {
          console.error("Error deleting kuitansi:", error);
          Swal.fire(
            "Error",
            `Gagal menghapus kuitansi: ${error.message}`,
            "error"
          );
        }
      }
    });
  };

  if (loading) {
    return <p>Memuat data kuitansi...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  // Filter users to get only ISE role for the dropdown
  const iseUsers = users.filter((user) => user.role === "ISE");

  // Untuk mendapatkan nama ISE yang dipilih untuk ditampilkan di strong tag
  const selectedIseDisplayName = selectedUserId
    ? iseUsers.find((u) => u.id_user === parseInt(selectedUserId, 10))?.nama ||
      "Pilih ISE"
    : "Pilih ISE";

  return (
    <div className="kuitansi-wrapper">
      <h1>Daftar Kuitansi</h1>

      <div className="filter-container">
        <div className="input-wrapper-search">
          <img src={searchIcon} alt="search" />
          <input
            type="text"
            placeholder="Cari berdasarkan nomor, nama, atau deskripsi"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div
          className="input-wrapper-calendar"
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
        <div className="input-wrapper-dropdown" onClick={toggleDropdown}>
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

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Nomor</th>
              <th>Nama Pelanggan</th>
              <th>Tanggal</th>
              <th>Jumlah (Rp)</th>
              <th>Terbilang</th>
              <th>Deskripsi</th>
              <th>Dibuat Oleh</th> {/* Tambah kolom pembuat */}
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
                        <button onClick={() => handleDelete(data.id_kuitansi)}>
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
    </div>
  );
}
