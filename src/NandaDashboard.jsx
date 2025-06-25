import React, { useState, useRef } from "react";
import Header from './Header';
import './NandaDashboard.css';

import buttonDelete from './assets/button_delete.png';
import buttonDownload from './assets/button_download.png';
import buttonNext from './assets/next-button.png';
import buttonPrevious from './assets/previous-button.png';
import searchIcon from './assets/search_icon.png';
import calendarIcon from './assets/calendar_icon.png';
import dropdownIcon from './assets/dropdown_icon.png';

const dummyData = [
  { nomor: 2424, nama: "Karina", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2425, nama: "Minerva", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2426, nama: "Romeda", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2427, nama: "K. M. Romeda", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2428, nama: "Carmenita", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2429, nama: "Yessica", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2430, nama: "Giselle", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2431, nama: "Ningning", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2432, nama: "Winter", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2433, nama: "Somi", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
];

export default function NandaDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedISE, setSelectedISE] = useState("ISE");
  const [showModal, setShowModal] = useState(false);
  const [dataToDelete, setDataToDelete] = useState(null);
  const dateRef = useRef(null);

  const totalPages = Math.ceil(dummyData.length / rowsPerPage);
  const currentData = dummyData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);
  const handleSelectISE = (name) => { setSelectedISE(name); setIsDropdownOpen(false); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
  const handlePrevious = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleRowsChange = (e) => { setRowsPerPage(parseInt(e.target.value)); setCurrentPage(1); };
  const handleDownload = (data) => console.log("Download data:", data);
  const handleDelete = (data) => { setDataToDelete(data); setShowModal(true); };
  const confirmDelete = () => { console.log("Data dihapus:", dataToDelete); setShowModal(false); setDataToDelete(null); };
  const cancelDelete = () => { setShowModal(false); setDataToDelete(null); };

  return (
    <div className="nanda-dashboard-layout">
      <Header />
      
      <main className="nanda-dashboard-content">
        <div className="page-actions">
          <div className="filters">
            <div className="input-wrapper">
              <img src={searchIcon} alt="search" />
              <input type="text" placeholder="Cari berdasarkan nama pelanggan" />
            </div>
            <div className="input-wrapper-calendar" onClick={() => dateRef.current?.showPicker()}>
                        <img src={calendarIcon} alt="calendar" style={{ cursor: "pointer" }} />
                        <input
                            type="date"
                            ref={dateRef}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
            <div className="input-wrapper dropdown" onClick={toggleDropdown}>
              <strong className="selected-ise-text">{selectedISE}</strong>
              <img src={dropdownIcon} alt="dropdown" />
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  {["Reqia Nurqalbi", "Andi Muthia", "Susanti", "Sakinah Nurusyifa"].map((name, idx) => (
                    <p key={idx} onClick={(e) => { e.stopPropagation(); handleSelectISE(name); }}>
                      {name}
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
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((data) => (
                <tr key={data.nomor}>
                  <td>{data.nomor}</td>
                  <td>{data.nama}</td>
                  <td>{data.tanggal}</td>
                  <td>Rp {data.jumlah.toLocaleString("id-ID")}</td>
                  <td>{data.terbilang}</td>
                  <td>{data.deskripsi}</td>
                  <td>
                    <button onClick={() => handleDelete(data)}>
                      <img src={buttonDelete} alt="Hapus" width={22} height={22} />
                    </button>
                    <button onClick={() => handleDownload(data)}>
                      <img src={buttonDownload} alt="Download" width={22} height={22} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-container">
          <p>Baris per halaman</p>
          <select className="dropdown" value={rowsPerPage} onChange={handleRowsChange}>
            {[10, 20, 30, 40].map((val) => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
          <div className="button-page">
            <button onClick={handlePrevious} disabled={currentPage === 1}>
              <img src={buttonPrevious} alt="Previous" />
            </button>
            <button onClick={handleNext} disabled={currentPage === totalPages}>
              <img src={buttonNext} alt="Next" />
            </button>
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <p>Apakah Anda yakin ingin menghapus data milik <strong>{dataToDelete?.nama}</strong>?</p>
              <div className="modal-buttons">
                <button onClick={confirmDelete}>Ya</button>
                <button onClick={cancelDelete}>Batal</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}