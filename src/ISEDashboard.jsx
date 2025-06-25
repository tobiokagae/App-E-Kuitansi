import React, { useState, useEffect, useRef } from "react";
import Header from "./Header";
import Swal from "sweetalert2";

import "./IseDashboard.css";

import searchIcon from "./assets/search_icon.png";
import calendarIcon from "./assets/calendar_icon.png";
import buttonNext from "./assets/next-button.png";
import buttonPrevious from "./assets/previous-button.png";
import buttonEdit from "./assets/button_edit.png";
import buttonDownload from "./assets/button_download.png";

import clearIcon from "./assets/button_delete2.png";
import saveIcon from "./assets/button_save.png";

const API_BASE_URL = "http://localhost:5000";

export default function IseDashboard() {
  const [kuitansiList, setKuitansiList] = useState([]);
  const [filteredKuitansi, setFilteredKuitansi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showAddReceiptModal, setShowAddReceiptModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentKuitansiId, setCurrentKuitansiId] = useState(null);

  // useRef untuk input tanggal di filter utama
  const dateRef = useRef(null);
  // useRef BARU untuk input tanggal di modal
  const modalDateInputRef = useRef(null);

  const [receiptForm, setReceiptForm] = useState({
    nomor_kuitansi: "",
    nama: "",
    tanggal: "",
    jumlah: "",
    terbilang: "",
    deskripsi: "",
  });

  const userRole = localStorage.getItem("userRole");
  const currentUserId = parseInt(localStorage.getItem("userId"), 10);

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
        // Filter kuitansi agar hanya menampilkan yang dibuat oleh user ISE saat ini
        const myKuitansi = data.data.filter((k) => k.id_user === currentUserId);
        setKuitansiList(myKuitansi);
      } else {
        throw new Error(data.message || "Gagal mengambil data kuitansi.");
      }
    } catch (err) {
      console.error("Error fetching kuitansi:", err);
      const errorMessage = "Gagal memuat data kuitansi: " + err.message;
      setError(errorMessage);
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan", // Bahasa Indonesia
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKuitansi();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDateFilter, setSelectedDateFilter] = useState("");

  useEffect(() => {
    let tempKuitansi = [...kuitansiList];

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

    if (selectedDateFilter) {
      tempKuitansi = tempKuitansi.filter((kuitansi) => {
        const kuitansiDate = new Date(kuitansi.tanggal)
          .toISOString()
          .split("T")[0];
        return kuitansiDate === selectedDateFilter;
      });
    }

    setFilteredKuitansi(tempKuitansi);
    setCurrentPage(1);
  }, [kuitansiList, searchTerm, selectedDateFilter]);

  const totalPages = Math.ceil(filteredKuitansi.length / rowsPerPage);
  const currentData = filteredKuitansi.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };
  const handleRowsChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const handleAddReceipt = () => {
    if (userRole !== "ISE") {
      Swal.fire(
        "Akses Ditolak",
        "Hanya ISE yang dapat membuat kuitansi.",
        "warning"
      );
      return;
    }
    setIsEditing(false);
    setCurrentKuitansiId(null);
    setReceiptForm({
      nomor_kuitansi: "",
      nama: "",
      tanggal: "",
      jumlah: "",
      terbilang: "",
      deskripsi: "",
    });
    setShowAddReceiptModal(true);
  };

  const handleEditReceipt = (kuitansi) => {
    if (userRole === "ISE" && kuitansi.id_user !== currentUserId) {
      Swal.fire(
        "Akses Ditolak",
        "Anda hanya dapat mengedit kuitansi yang Anda buat sendiri.",
        "warning"
      );
      return;
    }
    if (userRole !== "ISE" && userRole !== "admin") {
      Swal.fire(
        "Akses Ditolak",
        "Anda tidak memiliki izin untuk mengedit kuitansi ini.",
        "warning"
      );
      return;
    }

    setIsEditing(true);
    setCurrentKuitansiId(kuitansi.id_kuitansi);
    setReceiptForm({
      nomor_kuitansi: kuitansi.nomor_kuitansi,
      tanggal: kuitansi.tanggal,
      nama: kuitansi.nama,
      jumlah: kuitansi.jumlah,
      terbilang: kuitansi.terbilang,
      deskripsi: kuitansi.deskripsi,
    });
    setShowAddReceiptModal(true);
  };

  const closeAddReceiptModal = () => {
    setShowAddReceiptModal(false);
    setIsEditing(false);
    setCurrentKuitansiId(null);
    setReceiptForm({
      nomor_kuitansi: "",
      nama: "",
      tanggal: "",
      jumlah: "",
      terbilang: "",
      deskripsi: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReceiptForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearForm = () => {
    setReceiptForm({
      nomor_kuitansi: "",
      nama: "",
      tanggal: "",
      jumlah: "",
      terbilang: "",
      deskripsi: "",
    });
  };

  const handleSaveReceipt = async () => {
    if (
      !receiptForm.nomor_kuitansi ||
      !receiptForm.nama ||
      !receiptForm.tanggal ||
      !receiptForm.jumlah ||
      !receiptForm.terbilang ||
      !receiptForm.deskripsi
    ) {
      Swal.fire("Peringatan", "Semua field wajib diisi!", "warning"); // Bahasa Indonesia
      return;
    }
    if (isNaN(receiptForm.jumlah) || parseFloat(receiptForm.jumlah) <= 0) {
      Swal.fire("Peringatan", "Jumlah harus berupa angka positif.", "warning"); // Bahasa Indonesia
      return;
    }

    const payload = {
      ...receiptForm,
      jumlah: parseFloat(receiptForm.jumlah),
    };

    try {
      let response;
      let url;
      let method;

      if (isEditing) {
        url = `${API_BASE_URL}/kuitansi/edit_kuitansi/${currentKuitansiId}`;
        method = "PATCH";
      } else {
        url = `${API_BASE_URL}/kuitansi/create_kuitansi`;
        method = "POST";
      }

      response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        await showTimedSwal({
          icon: "success",
          title: "Berhasil!", // Bahasa Indonesia
          html: `${data.message} Modal akan menutup dalam <b></b> detik.`, // Bahasa Indonesia
          timer: 1500,
        });
        fetchKuitansi();
        closeAddReceiptModal();
      } else {
        throw new Error(data.message || "Gagal menyimpan kuitansi.");
      }
    } catch (error) {
      console.error("Error saving receipt:", error);
      Swal.fire({
        icon: "error",
        title: "Penyimpanan Gagal!", // Bahasa Indonesia
        text: `Gagal menyimpan kuitansi: ${error.message}`, // Bahasa Indonesia
      });
    }
  };

  const handleDownload = async (kuitansiId, nomorKuitansi) => {
    const kuitansiToDownload = kuitansiList.find(
      (k) => k.id_kuitansi === kuitansiId
    );
    if (!kuitansiToDownload) {
      Swal.fire("Error", "Kuitansi tidak ditemukan.", "error"); // Bahasa Indonesia
      return;
    }

    if (userRole === "ISE" && kuitansiToDownload.id_user !== currentUserId) {
      Swal.fire(
        "Akses Ditolak",
        "Anda tidak memiliki izin untuk mengunduh kuitansi ini.", // Bahasa Indonesia
        "warning"
      );
      return;
    }
    if (userRole !== "admin" && userRole !== "off3so" && userRole !== "ISE") {
      Swal.fire(
        "Akses Ditolak",
        "Anda tidak memiliki izin untuk mengunduh kuitansi.", // Bahasa Indonesia
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

  if (loading) {
    return (
      <div className="ise-dashboard-layout">
        <Header />
        <main className="ise-dashboard-content">
          <p>Memuat data kuitansi...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ise-dashboard-layout">
        <Header />
        <main className="ise-dashboard-content">
          <p className="error-message">{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="ise-dashboard-layout">
      <Header />

      <main className="ise-dashboard-content">
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
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <button className="add-receipt-button" onClick={handleAddReceipt}>
            Tambah Kuitansi
          </button>
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
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((data) => (
                  <tr key={data.id_kuitansi}>
                    <td>{data.nomor_kuitansi}</td>
                    <td>{data.nama}</td>
                    <td>{data.tanggal}</td>
                    <td>Rp {data.jumlah.toLocaleString("id-ID")}</td>
                    <td>{data.terbilang}</td>
                    <td>{data.deskripsi}</td>
                    <td>
                      {userRole === "ISE" && data.id_user === currentUserId && (
                        <button onClick={() => handleEditReceipt(data)}>
                          <img
                            src={buttonEdit}
                            alt="Edit"
                            width={22}
                            height={22}
                          />
                        </button>
                      )}
                      {(userRole === "admin" ||
                        userRole === "off3so" ||
                        (userRole === "ISE" &&
                          data.id_user === currentUserId)) && (
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
                            width={22}
                            height={22}
                          />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
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
          <p>Baris per halaman</p>
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
            <button onClick={handlePrevious} disabled={currentPage === 1}>
              <img src={buttonPrevious} alt="Previous" />
            </button>
            <p>
              {currentPage} / {totalPages}
            </p>
            <button onClick={handleNext} disabled={currentPage === totalPages}>
              <img src={buttonNext} alt="Next" />
            </button>
          </div>
        </div>

        {/* Modal untuk Tambah/Edit Kuitansi */}
        {showAddReceiptModal && (
          <div className="modal-overlay" onClick={closeAddReceiptModal}>
            <div
              className="modal-content add-receipt-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="close-modal-button"
                onClick={closeAddReceiptModal}
              >
                &times;
              </button>
              <h2>
                {isEditing
                  ? "Edit Kuitansi Pembayaran"
                  : "Form Kuitansi Pembayaran"}
              </h2>

              <div className="form-group">
                <label>Nomor Kuitansi</label>
                <input
                  type="text"
                  name="nomor_kuitansi"
                  value={receiptForm.nomor_kuitansi}
                  onChange={handleInputChange}
                  placeholder="Contoh: 001/KU/I/2025"
                  disabled={isEditing}
                />
              </div>
              <div
                className="form-group"
                onClick={() => modalDateInputRef.current?.showPicker()}
              >
                <label>Tanggal</label>
                <input
                  type="date"
                  name="tanggal"
                  ref={modalDateInputRef}
                  value={receiptForm.tanggal}
                  onChange={handleInputChange}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="form-group">
                <label>Nama</label>
                <input
                  type="text"
                  name="nama"
                  value={receiptForm.nama}
                  onChange={handleInputChange}
                  placeholder="Terima dari..."
                />
              </div>
              <div className="form-group">
                <label>Jumlah (Rp)</label>
                <input
                  type="number"
                  name="jumlah"
                  value={receiptForm.jumlah}
                  onChange={handleInputChange}
                  placeholder="Contoh: 105000"
                />
              </div>
              <div className="form-group">
                <label>Terbilang</label>
                <input
                  type="text"
                  name="terbilang"
                  value={receiptForm.terbilang}
                  onChange={handleInputChange}
                  placeholder="Contoh: Seratus lima ribu rupiah"
                />
              </div>
              <div className="form-group">
                <label>Deskripsi</label>
                <textarea
                  name="deskripsi"
                  value={receiptForm.deskripsi}
                  onChange={handleInputChange}
                  placeholder="Yaitu pembayaran untuk..."
                ></textarea>
              </div>

              <div className="modal-buttons form-buttons">
                <button className="clear-button" onClick={handleClearForm}>
                  <img src={clearIcon} alt="Bersihkan" /> Bersihkan
                </button>
                <button className="save-button" onClick={handleSaveReceipt}>
                  <img src={saveIcon} alt="Simpan" /> Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
