# App E-Kuitansi Frontend

<div align="center">
  <h3>🧾 Sistem Manajemen Kuitansi Digital</h3>
  <p>Antarmuka pengguna yang intuitif untuk mengelola kuitansi dan pengguna dengan berbagai tingkat akses</p>
</div>

---

## 📋 Daftar Isi

- [Tentang Aplikasi](#-tentang-aplikasi)
- [Fitur Utama](#-fitur-utama)
- [Teknologi](#-teknologi)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Struktur Aplikasi](#-struktur-aplikasi)
- [Peran Pengguna](#-peran-pengguna)
- [Alur Penggunaan](#-alur-penggunaan)
- [Panduan Deployment](#-panduan-deployment)
- [Kontribusi](#-kontribusi)

## 🎯 Tentang Aplikasi

App E-Kuitansi adalah sistem manajemen kuitansi digital yang memungkinkan organisasi untuk mengelola kuitansi secara elektronik dengan sistem peran yang terstruktur. Aplikasi ini menyediakan antarmuka yang user-friendly untuk berbagai tingkat pengguna dari ISE hingga Admin.

## ✨ Fitur Utama

### 🔐 Autentikasi & Keamanan

- Login aman menggunakan NIK atau Email
- Sistem peran bertingkat (Admin, ISE, Officer 3 Sales Operation)
- Protected routes berdasarkan peran pengguna

### 📄 Manajemen Kuitansi

- **Buat**: Tambah kuitansi baru dengan form yang lengkap
- **Lihat**: Tampilan daftar kuitansi dengan pencarian dan filter
- **Edit**: Modifikasi kuitansi (berdasarkan peran)
- **Hapus**: Penghapusan kuitansi (berdasarkan peran)
- **Download**: Export kuitansi ke format PDF

### 👥 Manajemen Pengguna (Admin Only)

- Tambah, edit, dan hapus pengguna
- Pengaturan peran dan hak akses
- Monitoring aktivitas pengguna

### 🎨 User Experience

- Notifikasi interaktif dengan SweetAlert2
- Progress bar untuk feedback loading
- Interface responsif dan intuitif

## 🛠 Teknologi

| Teknologi            | Versi   | Fungsi                  |
| -------------------- | ------- | ----------------------- |
| **React.js**         | ^18.0.0 | Frontend framework      |
| **React Router DOM** | ^6.0.0  | Client-side routing     |
| **SweetAlert2**      | ^11.0.0 | Notifikasi & konfirmasi |
| **NProgress**        | ^0.2.0  | Progress bar global     |
| **CSS**              | -       | Styling komponen        |

## 💻 Persyaratan Sistem

- **Node.js**: v14.x atau lebih tinggi
- **npm**: v6.x atau lebih tinggi
- **Browser**: Chrome, Firefox, Safari, Edge (versi terbaru)

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone <URL_REPOSITORY>
cd App-E-Kuitansi/FE/App-E-Kuitansi
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Verifikasi Instalasi

```bash
npm list --depth=0
```

## ⚙️ Konfigurasi

### Environment Configuration

Buat file `.env` di root folder untuk konfigurasi environment:

```bash
# .env
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_APP_NAME=E-Kuitansi
REACT_APP_VERSION=1.0.0
```

### API Configuration

Update API base URL di file komponen jika backend berjalan di alamat berbeda:

```javascript
// Contoh di Login.jsx
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
```

## 🎮 Menjalankan Aplikasi

### Development Mode

```bash
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

### Production Build

```bash
npm run build
```

### Testing

```bash
npm test
```

## 📁 Struktur Aplikasi

```
src/
├── components/           # Komponen React
│   ├── Dashboard/       # Komponen dashboard
│   ├── Auth/           # Komponen autentikasi
│   └── Common/         # Komponen umum
├── pages/              # Halaman utama
├── utils/              # Utility functions
├── styles/             # File CSS
└── App.js              # Main component
```

## 👤 Peran Pengguna

### 🔧 Admin

**Akses Penuh ke Seluruh Sistem**

- ✅ Manajemen kuitansi (CRUD)
- ✅ Manajemen pengguna (CRUD)
- ✅ Download & export data
- ✅ Monitoring sistem

### 💼 ISE (Individual Sales Executive)

**Fokus pada Kuitansi Personal**

- ✅ Buat kuitansi baru
- ✅ Lihat kuitansi yang dibuat sendiri
- ✅ Edit kuitansi sendiri
- ✅ Download kuitansi sendiri
- ❌ Tidak dapat menghapus kuitansi

### 📊 Officer 3 Sales Operation (Off3so)

**Supervisi dan Kontrol Kualitas**

- ✅ Lihat semua kuitansi
- ✅ Hapus kuitansi (quality control)
- ✅ Download semua kuitansi
- ✅ Filter berdasarkan ISE pembuat
- ❌ Tidak dapat edit kuitansi

## 🔄 Alur Penggunaan

### 1. 🔑 Login Process

```
User Input (NIK/Email + Password)
→ Validasi Backend
→ SweetAlert Success/Error
→ Redirect ke Dashboard sesuai Role
```

### 2. 📊 Dashboard Navigation

#### ISE Dashboard (`/ise-dashboard`)

- Daftar kuitansi personal
- Search & filter tools
- Action buttons (Add, Edit, Download)

#### Officer Dashboard (`/officer-dashboard`)

- Daftar semua kuitansi
- Advanced filtering (by ISE)
- Quality control actions (Delete, Download)

#### Admin Dashboard (`/admin-dashboard`)

- **Sidebar Navigation:**
  - 📄 Daftar Kuitansi (`/admin-dashboard/kuitansi`)
  - 👥 Daftar Pengguna (`/admin-dashboard/pengguna`)
- **Full CRUD Operations** untuk kedua entitas

### 3. 🚪 Logout Process

```
Click Logout Button
→ SweetAlert Confirmation
→ Clear localStorage
→ Redirect to Login
```

## 🌐 Panduan Deployment

### Production Build

```bash
npm run build
```

### Deploy ke Server

```bash
# Upload folder build/ ke web server
# Pastikan server dikonfigurasi untuk SPA routing
```

### Environment Variables untuk Production

```bash
REACT_APP_API_BASE_URL=https://your-api-domain.com
REACT_APP_ENV=production
```

## 🤝 Kontribusi

1. Fork repository
2. Buat branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 Catatan Penting

- ⚠️ **Backend Dependency**: Pastikan backend berjalan di `http://localhost:5000`
- 🔒 **Route Protection**: Semua dashboard routes dilindungi `ProtectedRoute`
- 🎨 **Consistent UX**: SweetAlert2 digunakan untuk semua notifikasi
- 📱 **Responsive**: Interface dapat diakses di berbagai ukuran layar

## 📞 Support

Jika mengalami masalah atau memiliki pertanyaan:

- Buat issue di GitHub repository
- Hubungi tim development

---

<div align="center">
  <p>Dibuat dengan ❤️ untuk digitalisasi proses kuitansi</p>
  <p><strong>E-Kuitansi v1.0.0</strong></p>
</div>
