import React, { useState, useEffect } from "react";
import Swal from "sweetalert2"; // Import SweetAlert2
import "./DaftarPengguna.css";

import searchIcon from "./assets/search_icon.png";
import buttonEdit from "./assets/button_edit.png";
import buttonDelete from "./assets/button_delete.png";
import buttonNext from "./assets/next-button.png";
import buttonPrevious from "./assets/previous-button.png";
import buttonDeleteForm from "./assets/button_delete2.png"; // Untuk tombol 'Bersihkan' di modal
import buttonSave from "./assets/button_save.png"; // Untuk tombol 'Simpan' di modal

const API_BASE_URL = "http://localhost:5000"; // Sesuaikan jika backend Anda berjalan di port atau host lain

export default function DaftarPengguna() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // Untuk menyimpan hasil filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // Digunakan untuk edit/delete
  const [searchTerm, setSearchTerm] = useState(""); // Untuk input pencarian

  const userRole = localStorage.getItem("userRole"); // Ambil role pengguna dari localStorage

  // Mapping role dari display name ke nilai enum backend
  const roleFrontendToBackend = {
    Admin: "admin",
    ISE: "ISE",
    "Officer 3 Sales Operation": "off3so",
  };

  // Mapping role dari nilai enum backend ke display name
  const roleBackendToFrontend = {
    admin: "Admin",
    ISE: "ISE",
    off3so: "Officer 3 Sales Operation",
  };

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

  // Fungsi untuk mengambil daftar pengguna dari backend
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/users/get_users`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.data);
      } else {
        throw new Error(data.message || "Gagal mengambil data pengguna.");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      const errorMessage = "Gagal memuat data pengguna: " + err.message;
      setError(errorMessage);
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan", // Judul error Bahasa Indonesia
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []); // Ambil data pengguna saat komponen dimuat

  // Effect untuk filtering pengguna berdasarkan searchTerm
  useEffect(() => {
    let tempUsers = [...users];

    if (searchTerm) {
      tempUsers = tempUsers.filter(
        (user) =>
          user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email_nik.toLowerCase().includes(searchTerm.toLowerCase()) // Filter berdasarkan email_nik
      );
    }
    setFilteredUsers(tempUsers);
    setCurrentPage(1); // Reset halaman ke 1 setelah filter
  }, [users, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredUsers.slice(startIndex, startIndex + rowsPerPage);

  const handleAddUser = () => {
    // Hanya admin yang bisa menambah pengguna
    if (userRole !== "admin") {
      Swal.fire(
        "Akses Ditolak",
        "Anda tidak memiliki izin untuk menambah pengguna.",
        "warning"
      );
      return;
    }
    // Set user baru dengan nilai default
    setSelectedUser({
      id_user: null,
      nama: "",
      email_nik: "",
      role: "ISE",
      password: "",
    });
    setShowEditModal(true);
  };

  const handleClearFields = () => {
    // Membersihkan field di modal
    setSelectedUser((prev) => ({
      ...prev,
      nama: "",
      email_nik: "",
      role: "ISE",
      password: "",
    }));
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleRowsChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const handleDelete = (user) => {
    // Hanya admin yang bisa menghapus pengguna
    if (userRole !== "admin") {
      Swal.fire(
        "Akses Ditolak",
        "Anda tidak memiliki izin untuk menghapus pengguna.",
        "warning"
      );
      return;
    }
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/delete_user/${selectedUser.id_user}`,
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
          title: "Berhasil Dihapus!", // Judul sukses Bahasa Indonesia
          html: `${data.message} Modal akan menutup dalam <b></b> detik.`,
          timer: 1500,
        });
        fetchUsers(); // Ambil ulang data setelah penghapusan
      } else {
        throw new Error(data.message || "Gagal menghapus pengguna.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      Swal.fire({
        icon: "error",
        title: "Penghapusan Gagal!", // Judul error Bahasa Indonesia
        text: `Gagal menghapus pengguna: ${error.message}`,
      });
    } finally {
      setShowDeleteModal(false);
      setSelectedUser(null);
    }
  };

  const handleEdit = (user) => {
    // Hanya admin yang bisa mengedit pengguna (di tampilan ini)
    if (userRole !== "admin") {
      Swal.fire(
        "Akses Ditolak",
        "Anda tidak memiliki izin untuk mengedit pengguna.",
        "warning"
      );
      return;
    }
    setSelectedUser({
      ...user,
      // Pastikan role di-map ke nilai yang bisa dipilih di select
      role: roleBackendToFrontend[user.role] || user.role, // Gunakan display name
    });
    setShowEditModal(true);
  };

  const confirmEdit = async () => {
    // Persiapan data untuk dikirim ke backend
    const userDataToSend = {
      nama: selectedUser.nama,
      email_nik: selectedUser.email_nik,
      // Map role dari display name ke nilai enum backend
      role: roleFrontendToBackend[selectedUser.role] || selectedUser.role,
    };

    // Tambahkan password hanya jika ada perubahan atau ini pengguna baru
    if (selectedUser.password) {
      userDataToSend.password = selectedUser.password;
    } else if (!selectedUser.id_user) {
      // Jika membuat pengguna baru dan password kosong, ini harus ditangani validasi backend
      // atau berikan feedback ke user bahwa password tidak boleh kosong.
      await Swal.fire(
        "Peringatan",
        "Password wajib diisi untuk pengguna baru.",
        "warning"
      );
      return;
    }

    try {
      let response;
      let data;
      if (selectedUser.id_user) {
        // Mode Edit (PATCH)
        response = await fetch(
          `${API_BASE_URL}/users/edit_user/${selectedUser.id_user}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify(userDataToSend),
          }
        );
        data = await response.json();
        if (response.ok) {
          await showTimedSwal({
            icon: "success",
            title: "Berhasil!",
            html: `${data.message} Modal akan menutup dalam <b></b> detik.`,
            timer: 1500,
          });
        } else {
          throw new Error(data.message || "Gagal mengedit pengguna.");
        }
      } else {
        // Mode Tambah (POST)
        response = await fetch(`${API_BASE_URL}/users/create_user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(userDataToSend),
        });
        data = await response.json();
        if (response.ok) {
          await showTimedSwal({
            icon: "success",
            title: "Berhasil!",
            html: `${data.message} Modal akan menutup dalam <b></b> detik.`,
            timer: 1500,
          });
        } else {
          throw new Error(data.message || "Gagal menambah pengguna.");
        }
      }
      fetchUsers(); // Ambil ulang data setelah operasi
    } catch (error) {
      console.error("Error saving user:", error);
      Swal.fire({
        icon: "error",
        title: "Penyimpanan Gagal!", // Judul error Bahasa Indonesia
        text: `Gagal menyimpan pengguna: ${error.message}`,
      });
    } finally {
      setShowEditModal(false);
      setSelectedUser(null);
    }
  };

  const cancelModal = () => {
    setShowDeleteModal(false);
    setShowEditModal(false);
    setSelectedUser(null);
  };

  if (loading) {
    return <p>Memuat data pengguna...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  // Tampilkan pesan jika pengguna tidak memiliki izin untuk melihat daftar ini
  if (userRole !== "admin") {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#555" }}>
        <p>Anda tidak memiliki izin untuk melihat daftar pengguna.</p>
      </div>
    );
  }

  return (
    <>
      <h1>Daftar Pengguna</h1>
      <div className="pengguna-actions">
        <div className="input-wrapper-search2">
          <img src={searchIcon} alt="search" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau NIK/Email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={handleAddUser}>Tambah Pengguna</button>
      </div>

      <div className="table-wrapper2">
        <table className="table">
          <thead>
            <tr>
              <th>NIK/Email</th>
              <th>Nama Pengguna</th>
              <th>Role</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((user) => (
                <tr key={user.id_user}>
                  {" "}
                  {/* Gunakan id_user sebagai key yang unik */}
                  <td>{user.email_nik}</td>{" "}
                  {/* Sesuaikan dengan nama field dari backend */}
                  <td>{user.nama}</td>
                  <td>{roleBackendToFrontend[user.role] || user.role}</td>{" "}
                  {/* Pastikan role di-map untuk tampilan */}
                  <td>
                    <button onClick={() => handleEdit(user)}>
                      <img src={buttonEdit} alt="Edit" width={22} height={22} />
                    </button>
                    <button onClick={() => handleDelete(user)}>
                      <img
                        src={buttonDelete}
                        alt="Hapus"
                        width={22}
                        height={22}
                      />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Tidak ada data pengguna yang ditemukan.
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
          {/* Tambahkan elemen <p> untuk menampilkan nomor halaman */}
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

      {/* --- MODAL DELETE CONFIRMATION --- */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={cancelModal}>
              &times;
            </button>
            <h2>Konfirmasi Hapus Pengguna</h2>
            <p>
              Anda yakin ingin menghapus pengguna{" "}
              <strong>{selectedUser?.nama}</strong>?
            </p>
            <div className="modal-buttons">
              <button className="button-clear" onClick={cancelModal}>
                Batal
              </button>
              <button className="button-save" onClick={confirmDelete}>
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL EDIT/TAMBAH --- */}
      {showEditModal && (
        <div className="modal-overlay" onClick={cancelModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={cancelModal}>
              &times;
            </button>

            <h2>
              {selectedUser && selectedUser.id_user
                ? "Edit Pengguna"
                : "Tambah Pengguna"}
            </h2>

            <div className="form-grid">
              <label>Nama</label>
              <input
                type="text"
                placeholder="Nama Pengguna"
                value={selectedUser?.nama || ""}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, nama: e.target.value })
                }
              />
              <label>NIK/Email</label>
              <input
                type="text" // Menggunakan text karena bisa NIK atau Email
                placeholder="NIK/Email Pengguna"
                value={selectedUser?.email_nik || ""} // Gunakan email_nik
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    email_nik: e.target.value,
                  })
                }
              />
              <label>Role</label>
              <select
                value={selectedUser?.role || "ISE"} // Default ke ISE
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, role: e.target.value })
                }
              >
                <option value="ISE">ISE</option>
                <option value="Officer 3 Sales Operation">
                  Officer 3 Sales Operation
                </option>
                <option value="Admin">Admin</option>
              </select>
              <label>Password</label>
              <input
                type="password" // Gunakan type="password" untuk keamanan
                placeholder="Password (kosongkan jika tidak ingin diubah)"
                value={selectedUser?.password || ""}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, password: e.target.value })
                }
              />
            </div>
            <div className="modal-buttons">
              <button className="button-clear" onClick={handleClearFields}>
                <img
                  src={buttonDeleteForm}
                  alt="Bersihkan"
                  className="button-icon-delete"
                />
                Bersihkan
              </button>
              <button className="button-save" onClick={confirmEdit}>
                <img
                  src={buttonSave}
                  alt="Simpan"
                  className="button-icon-save"
                />
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
