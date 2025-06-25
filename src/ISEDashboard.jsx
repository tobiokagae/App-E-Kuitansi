import React, { useState, useRef } from "react";
import Header from './Header'; // Pastikan path ini benar
import './IseDashboard.css'; // Kita akan membuat file CSS baru untuk ini

import searchIcon from './assets/search_icon.png';
import calendarIcon from './assets/calendar_icon.png';
import buttonNext from './assets/next-button.png';
import buttonPrevious from './assets/previous-button.png';

// Import ikon untuk tombol modal
import clearIcon from './assets/button_delete2.png'; // Pastikan Anda memiliki ikon ini
import saveIcon from './assets/button_save.png';   // Pastikan Anda memiliki ikon ini

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

export default function IseDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showAddReceiptModal, setShowAddReceiptModal] = useState(false); // State baru untuk modal
  const dateRef = useRef(null);

  // State untuk menyimpan input form kuitansi baru
  const [newReceipt, setNewReceipt] = useState({
    tanggal: '',
    nama: '',
    terbilang: '',
    deskripsi: '',
    jumlah: ''
  });

  const totalPages = Math.ceil(dummyData.length / rowsPerPage);
  const currentData = dummyData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
  const handlePrevious = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleRowsChange = (e) => { setRowsPerPage(parseInt(e.target.value)); setCurrentPage(1); };
  
  // Fungsi untuk membuka modal
  const handleAddReceipt = () => {
    setShowAddReceiptModal(true);
  };

  // Fungsi untuk menutup modal
  const closeAddReceiptModal = () => {
    setShowAddReceiptModal(false);
    // Reset form saat modal ditutup
    setNewReceipt({
      tanggal: '',
      nama: '',
      terbilang: '',
      deskripsi: '',
      jumlah: ''
    });
  };

  // Handler perubahan input form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReceipt(prev => ({ ...prev, [name]: value }));
  };

  // Handler untuk tombol "Bersihkan" di modal
  const handleClearForm = () => {
    setNewReceipt({
      tanggal: '',
      nama: '',
      terbilang: '',
      deskripsi: '',
      jumlah: ''
    });
  };

  // Handler untuk tombol "Simpan" di modal
  const handleSaveReceipt = () => {
    console.log("Data Kuitansi Baru Disimpan:", newReceipt);
    // Di sini Anda akan menambahkan logika untuk menyimpan data ke backend
    // atau ke state global/Redux jika menggunakan itu.
    // Contoh: tambahkan ke dummyData (hanya untuk demo)
    // const newNomor = Math.max(...dummyData.map(d => d.nomor)) + 1;
    // dummyData.push({ nomor: newNomor, ...newReceipt });
    
    alert("Kuitansi berhasil disimpan!"); // Notifikasi sementara
    closeAddReceiptModal(); // Tutup modal setelah disimpan
  };

  return (
    <div className="ise-dashboard-layout">
      <Header />
      
      <main className="ise-dashboard-content">
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

        {/* Modal untuk Tambah Kuitansi */}
        {showAddReceiptModal && (
          <div className="modal-overlay" onClick={closeAddReceiptModal}> {/* Klik overlay untuk menutup modal */}
            <div className="modal-content add-receipt-modal" onClick={(e) => e.stopPropagation()}> {/* Mencegah penutupan saat klik di dalam modal */}
              <h2>Form Kwitansi Pembayaran</h2>
              <div className="form-group">
                <label>Tanggal</label>
                <input 
                    type="date" 
                    name="tanggal" 
                    value={newReceipt.tanggal} 
                    onChange={handleInputChange} 
                    placeholder="DD/MM/YYYY" 
                />
              </div>
              <div className="form-group">
                <label>Nama</label>
                <input 
                    type="text" 
                    name="nama" 
                    value={newReceipt.nama} 
                    onChange={handleInputChange} 
                    placeholder="Terima dari..." 
                />
              </div>
              <div className="form-group">
                <label>Terbilang</label>
                <input 
                    type="text" 
                    name="terbilang" 
                    value={newReceipt.terbilang} 
                    onChange={handleInputChange} 
                    placeholder="Contoh: Seratus lima ribu" 
                />
              </div>
              {/* Desain Anda memiliki "Terbilang" dua kali, saya asumsikan yang kedua adalah "Jumlah" di desain awal. Jika memang Terbilang dua kali, biarkan saja. Saya akan biarkan sama seperti desain Anda untuk saat ini.*/}
              <div className="form-group">
                <label>Jumlah (Rp)</label>
                <input 
                    type="number" // Menggunakan type="number" untuk jumlah
                    name="jumlah" 
                    value={newReceipt.jumlah} 
                    onChange={handleInputChange} 
                    placeholder="Contoh: 105000" 
                />
              </div>
              <div className="form-group">
                <label>Deskripsi</label>
                <textarea 
                    name="deskripsi" 
                    value={newReceipt.deskripsi} 
                    onChange={handleInputChange} 
                    placeholder="Yaitu pembayaran..." 
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