import React, { useState } from 'react';
import './DaftarPengguna.css';
// import Sidebar from './Sidebar';
import searchIcon from './assets/search_icon.png';
import buttonEdit from './assets/button_edit.png';
import buttonDelete from './assets/button_delete.png';
import buttonNext from './assets/next-button.png';
import buttonPrevious from './assets/previous-button.png';
import buttonDeleteForm from './assets/button_delete2.png';
import buttonSave from './assets/button_save.png';

const initialUsers = [
  { email: 'alisha@mail.com', nama: 'Karina', role: 'ISE', password: 'nfjerrgerroekgeof32r' },
  { email: 'alisha@mail.com', nama: 'Minerva', role: 'Officer 3 Sales Operation', password: 'nfjerrgerroekgeof32r' },
  { email: 'alisha@mail.com', nama: 'Romeda', role: 'ISE', password: 'nfjerrgerroekgeof32r' },
  { email: 'alisha@mail.com', nama: 'Karina Minerva Romeda', role: 'ISE', password: 'nfjerrgerroekgeof32r' },
  { email: 'alisha@mail.com', nama: 'Carmenita', role: 'ISE', password: 'nfjerrgerroekgeof32r' },
  { email: 'alisha@mail.com', nama: 'Carmenita', role: 'ISE', password: 'nfjerrgerroekgeof32r' },
  { email: 'alisha@mail.com', nama: 'Carmenita', role: 'ISE', password: 'nfjerrgerroekgeof32r' },
  { email: 'alisha@mail.com', nama: 'Carmenita', role: 'ISE', password: 'nfjerrgerroekgeof32r' },
  { email: 'alisha@mail.com', nama: 'Carmenita', role: 'ISE', password: 'nfjerrgerroekgeof32r' },
  { email: 'alisha@mail.com', nama: 'Carmenita', role: 'ISE', password: 'nfjerrgerroekgeof32r' },
  { email: 'alisha@mail.com', nama: 'Carmenita', role: 'ISE', password: 'nfjerrgerroekgeof32r' },
  { email: 'alisha@mail.com', nama: 'Carmenita', role: 'ISE', password: 'nfjerrgerroekgeof32r' },
];

export default function DaftarPengguna() {
  const [users, setUsers] = useState(initialUsers);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleAddUser = () => {
    setSelectedUser({ nama: '', email: '', role: '', password: '' });
    setShowEditModal(true);
  };

  const handleClearFields = () => {
    setSelectedUser({ nama: '', email: '', role: '', password: '' });
  };


  const totalPages = Math.ceil(users.length / rowsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleRowsChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setUsers(users.filter((u) => u !== selectedUser));
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const handleEdit = (user) => {
    setSelectedUser({ ...user });
    setShowEditModal(true);
  };

  const confirmEdit = () => {
    setUsers((prev) => {
        const existing = prev.find((u) => u.email === selectedUser.email);
        if (existing) {
            return prev.map((u) => (u.email === selectedUser.email ? selectedUser : u));
        } else {
            return [...prev, selectedUser];
        }
    });
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const cancelModal = () => {
    setShowDeleteModal(false);
    setShowEditModal(false);
    setSelectedUser(null);
  };

  return (
    <>
      {/* <main className="main-content"> sekarang ada di AdminDashboard.js */}
      <h1>Daftar Pengguna</h1>
      <div className="pengguna-actions">
        {/* ...sisa kode JSX Anda dari sini ke bawah tetap sama... */}
        <div className="input-wrapper-search2">
          <img src={searchIcon} alt="search" />
          <input type="text" placeholder="Cari berdasarkan nama pengguna" />
        </div>
        <button onClick={handleAddUser}>Tambah Pengguna</button>
      </div>

      {/* ... Lanjutkan sisa kode JSX Anda ... */}
      <div className="table-wrapper2">
          <table className="table">
            <thead>
              <tr>
                <th>NIK/Email</th>
                <th>Nama Pengguna</th>
                <th>Role</th>
                <th>Password</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((user, index) => (
                <tr key={index}>
                  <td>{user.email}</td>
                  <td>{user.nama}</td>
                  <td>{user.role}</td>
                  <td>{user.password}</td>
                  <td>
                    <button onClick={() => handleEdit(user)}>
                      <img src={buttonEdit} alt="Edit" width={22} height={22} />
                    </button>
                    <button onClick={() => handleDelete(user)}>
                      <img src={buttonDelete} alt="Hapus" width={22} height={22} />
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

        {/* --- MODAL EDIT/TAMBAH YANG DIPERBARUI --- */}
      {showEditModal && (
        <div className="modal-overlay" onClick={cancelModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* 1. Tambahkan Tombol Close 'X' di sini */}
            <button className="modal-close-button" onClick={cancelModal}>&times;</button>
            
            <h2>Data Pengguna</h2>

            <div className="form-grid">
                <label>Nama</label>
                <input type="text" placeholder="Nama Pengguna" value={selectedUser?.nama || ''} onChange={(e) => setSelectedUser({ ...selectedUser, nama: e.target.value })} />
                <label>NIK/Email</label>
                <input type="email" placeholder="NIK/Email Pengguna" value={selectedUser?.email || ''} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} />
                <label>Role</label>
                <select value={selectedUser?.role || ''} onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}>
                    <option value="" disabled>Pilih Role</option>
                    <option value="ISE">ISE</option>
                    <option value="Officer 3 Sales Operation">Officer 3 Sales Operation</option>
                    <option value="Admin">Admin</option>
                </select>
                <label>Password</label>
                <input type="text" placeholder="Password Pengguna" value={selectedUser?.password || ''} onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })} />
            </div>
            <div className="modal-buttons">
              {/* 2. Ganti className tombol agar sesuai dengan CSS baru */}
              <button className="button-clear" onClick={handleClearFields}>
                <img src={buttonDeleteForm} alt="Batal" className="button-icon-delete" />
                Bersihkan
              </button>
              <button className="button-save" onClick={confirmEdit}>
                <img src={buttonSave} alt="Simpan" className="button-icon-save" />
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}