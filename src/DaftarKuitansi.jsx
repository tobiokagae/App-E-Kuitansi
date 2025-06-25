import React, { useState, useRef } from "react";

import './DaftarKuitansi.css';
import searchIcon from './assets/search_icon.png';
import calendarIcon from './assets/calendar_icon.png';
import dropdownIcon from './assets/dropdown_icon.png';
import buttonDelete from './assets/button_delete.png';
import buttonDownload from './assets/button_download.png';

const dummyData = [
  { nomor: 2424, nama: "Karina", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2424, nama: "Minerva", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2424, nama: "Romeda", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2424, nama: "Karina Minerva Romeda", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2424, nama: "Carmenita", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2424, nama: "Carmenita", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2424, nama: "Carmenita", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2424, nama: "Carmenita", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2424, nama: "Carmenita", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2424, nama: "Carmenita", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
];

export default function DaftarKuitansi() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedISE, setSelectedISE] = useState("ISE");

  const [showModal, setShowModal] = useState(false);
  const [dataToDelete, setDataToDelete] = useState(null);

  const totalPages = Math.ceil(dummyData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = dummyData.slice(startIndex, startIndex + rowsPerPage);

  const dateRef = useRef(null);

  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);
  const handleSelectISE = (name) => {
    setSelectedISE(name);
    setIsDropdownOpen(false);
  };

  const handleDownload = (data) => {
    console.log("Download data:", data);
  };

  const handleDelete = (data) => {
    setDataToDelete(data);
    setShowModal(true);
  };

  const confirmDelete = () => {
    console.log("Data dihapus:", dataToDelete);
    setShowModal(false);
    setDataToDelete(null);
  };

  const cancelDelete = () => {
    setShowModal(false);
    setDataToDelete(null);
  };

  return (
    <div className="kuitansi-content">
      <h1>Daftar Kuitansi</h1>

        <div className="table-wrapper">
            <div className="filter-container">
                <div className="input-wrapper-search">
                    <img src={searchIcon} alt="search" />
                    <input type="text" placeholder="Cari berdasarkan nama pelanggan" />
                </div>

                <div className="input-wrapper-calendar" onClick={() => dateRef.current?.showPicker()}>
                    <img src={calendarIcon} alt="calendar" style={{ cursor: "pointer" }} />
                    <input
                        type="date"
                        ref={dateRef}
                        placeholder="DD/MM/YYYY"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>

                <div className="input-wrapper-dropdown" onClick={toggleDropdown}>
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

            <table className="table">
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
                    {currentData.map((data, index) => (
                    <tr key={index}>
                        <td>{data.nomor}</td>
                        <td>{data.nama}</td>
                        <td>{data.tanggal}</td>
                        <td>Rp {data.jumlah.toLocaleString("id-ID")}</td>
                        <td>{data.terbilang}</td>
                        <td>{data.deskripsi}</td>
                        <td>
                        <button onClick={() => handleDelete(data)}>
                            <img src={buttonDelete} alt="Hapus" width={25} height={25} />
                        </button>
                        <button onClick={() => handleDownload(data)}>
                            <img src={buttonDownload} alt="Download" width={25} height={25} />
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Custom Popup Modal */}
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
    </div>
      
  );
}
