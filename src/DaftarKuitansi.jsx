import React, { useState, useRef } from "react";

// Pastikan Anda mengimpor file CSS terpadu yang benar
// Jika Anda menyimpan CSS terpadu di 'DaftarPengguna.css', maka import ini sudah benar.
import './DaftarKuitansi.css'; 

import searchIcon from './assets/search_icon.png';
import calendarIcon from './assets/calendar_icon.png';
import dropdownIcon from './assets/dropdown_icon.png';
import buttonDelete from './assets/button_delete.png';
import buttonDownload from './assets/button_download.png';
import buttonNext from './assets/next-button.png';
import buttonPrevious from './assets/previous-button.png';

const dummyData = [
  { nomor: 2424, nama: "Karina", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2425, nama: "Minerva", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2426, nama: "Romeda", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2427, nama: "Karina Minerva Romeda", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2428, nama: "Carmenita", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2429, nama: "Carmenita", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2430, nama: "Carmenita", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2431, nama: "Carmenita", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2432, nama: "Carmenita", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2433, nama: "Carmenita", tanggal: "31/12/2025", jumlah: 985000, terbilang: "Sembilan ratus delapan puluh lima ribu rupiah", deskripsi: "Pembayaran tagihan" },
  { nomor: 2434, nama: "John Doe", tanggal: "01/01/2026", jumlah: 1500000, terbilang: "Satu juta lima ratus ribu rupiah", deskripsi: "Sewa bulanan" },
  { nomor: 2435, nama: "Jane Smith", tanggal: "02/01/2026", jumlah: 750000, terbilang: "Tujuh ratus lima puluh ribu rupiah", deskripsi: "Pembelian ATK" },
];

export default function DaftarKuitansi() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedISE, setSelectedISE] = useState("ISE");
  const [showModal, setShowModal] = useState(false);
  const [dataToDelete, setDataToDelete] = useState(null);
  const dateRef = useRef(null);

  const totalPages = Math.ceil(dummyData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = dummyData.slice(startIndex, startIndex + rowsPerPage);

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
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

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
    // Di aplikasi nyata, Anda akan memfilter 'dummyData' di sini
    setShowModal(false);
    setDataToDelete(null);
  };

  const cancelDelete = () => {
    setShowModal(false);
    setDataToDelete(null);
  };

  return (
    <>
      <h1>Daftar Kuitansi</h1>

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

      <div className="pagination-container">
        <p className="information">Baris per halaman</p>
        <select className="dropdown" value={rowsPerPage} onChange={handleRowsChange}>
          {[10, 20, 30, 40].map((val) => (
            <option key={val} value={val}>{val}</option>
          ))}
        </select>
        <div className="button-page">
          <button className="previous-page" onClick={handlePrevious} disabled={currentPage === 1}>
            <img src={buttonPrevious} alt="Previous" />
          </button>
          <button className="next-page" onClick={handleNext} disabled={currentPage === totalPages}>
            <img src={buttonNext} alt="Next" />
          </button>
        </div>
      </div>
    </>
  );
}