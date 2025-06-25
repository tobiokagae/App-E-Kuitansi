# App E-Kuitansi

<div align="center">
  <h1>🧾 Sistem Manajemen Kuitansi Digital</h1>
  <p><strong>Solusi Full-Stack Lengkap untuk Manajemen Kuitansi Modern</strong></p>
  
  ![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?logo=react)
  ![Flask](https://img.shields.io/badge/Backend-Flask-000000?logo=flask)
  ![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white)
  ![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens)
  
  <p>
    <a href="#mulai-cepat">Mulai Cepat</a> •
    <a href="#arsitektur">Arsitektur</a> •
    <a href="#fitur">Fitur</a> •
    <a href="#dokumentasi">Dokumentasi</a> •
    <a href="#deployment">Deployment</a>
  </p>
</div>

---

## 📖 Gambaran Umum

App E-Kuitansi adalah sistem manajemen kuitansi digital yang komprehensif, dirancang untuk menyederhanakan proses pembuatan, pengelolaan, dan pelacakan kuitansi dalam organisasi modern. Dibangun dengan teknologi terkini, aplikasi ini memberikan pengalaman yang seamless untuk pengguna dengan berbagai peran dan tanggung jawab.

### 🎯 Tujuan Proyek
- **Digitalisasi Manajemen Kuitansi**: Transformasi sistem kuitansi berbasis kertas tradisional
- **Kontrol Akses Berbasis Peran**: Manajemen pengguna multi-tingkat yang aman
- **Generasi PDF Otomatis**: Format kuitansi profesional dan ekspor otomatis
- **Jejak Audit**: Pelacakan lengkap siklus hidup kuitansi
- **Antarmuka User-Friendly**: Desain intuitif untuk semua level pengguna

## 🏗 Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React.js)                      │
├─────────────────────────────────────────────────────────────┤
│  • React Router DOM    • SweetAlert2    • CSS Styling      │
│  • Dashboard Components    • Authentication    • Forms      │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/REST API
┌─────────────────────────▼───────────────────────────────────┐
│                    BACKEND (Flask)                          │
├─────────────────────────────────────────────────────────────┤
│  • JWT Authentication    • SQLAlchemy ORM                   │
│  • Role-Based Access     • PDF Generation                   │
│  • API Endpoints         • CORS Configuration               │
└─────────────────────────┬───────────────────────────────────┘
                          │ Database Connection
┌─────────────────────────▼───────────────────────────────────┐
│                    DATABASE (MySQL)                         │
├─────────────────────────────────────────────────────────────┤
│  • Users Table           • Receipts Table                   │
│  • Relationships         • Indexes & Constraints            │
└─────────────────────────────────────────────────────────────┘
```

## ✨ Fitur Utama

### 🔐 Sistem Autentikasi & Keamanan
- **Login Aman**: Autentikasi menggunakan NIK/Email dan password
- **JWT Token**: Sistem token yang aman untuk session management
- **Role-Based Access Control**: Tiga tingkatan peran pengguna
- **Password Hashing**: Enkripsi password dengan PBKDF2-SHA256

### 👥 Manajemen Peran Pengguna

| Peran | Deskripsi | Hak Akses |
|-------|-----------|-----------|
| **Admin** | Administrator sistem | ✅ Kelola semua kuitansi<br>✅ Kelola semua pengguna<br>✅ Download & hapus kuitansi<br>✅ Akses penuh sistem |
| **ISE** | Individual Sales Executive | ✅ Buat kuitansi baru<br>✅ Edit kuitansi sendiri<br>✅ Lihat kuitansi sendiri<br>✅ Download kuitansi sendiri |
| **Officer 3SO** | Officer 3 Sales Operation | ✅ Lihat semua kuitansi<br>✅ Hapus kuitansi<br>✅ Download semua kuitansi<br>✅ Quality control |

### 📄 Manajemen Kuitansi
- **CRUD Operations**: Create, Read, Update, Delete kuitansi
- **PDF Generation**: Otomatis generate kuitansi dalam format PDF
- **Search & Filter**: Pencarian dan filter berdasarkan berbagai kriteria
- **Audit Trail**: Pelacakan history perubahan kuitansi

### 🎨 User Experience
- **Responsive Design**: Tampilan yang optimal di berbagai perangkat
- **Interactive Notifications**: Notifikasi interaktif dengan SweetAlert2
- **Progress Indicators**: Loading indicators untuk feedback pengguna
- **Intuitive Navigation**: Navigasi yang mudah dipahami

## 📁 Struktur Proyek

```
App-E-Kuitansi/
├── 📁 FE/                          # Frontend Application
│   └── App-E-Kuitansi/
│       ├── 📁 public/              # Static assets
│       ├── 📁 src/                 # Source code
│       │   ├── 📁 components/      # React components
│       │   ├── 📁 pages/           # Page components
│       │   ├── 📁 utils/           # Utility functions
│       │   └── 📁 styles/          # CSS styles
│       ├── 📄 package.json         # NPM dependencies
│       └── 📄 README.md            # Frontend documentation
│
├── 📁 BE/                          # Backend Application
│   └── App-E-Kuitansi/
│       ├── 📁 model/               # Database models
│       ├── 📁 route/               # API routes
│       ├── 📁 utils/               # Utility functions
│       ├── 📄 main.py              # Application entry point
│       ├── 📄 config.py            # Configuration
│       ├── 📄 requirements.txt     # Python dependencies
│       └── 📄 README.md            # Backend documentation
│
├── 📁 docs/                        # Documentation
├── 📁 database/                    # Database scripts
├── 📄 docker-compose.yml           # Docker configuration
└── 📄 README.md                    # This file
```

## 🚀 Mulai Cepat

### Prasyarat Sistem
- **Node.js** 14.x atau lebih tinggi
- **Python** 3.8 atau lebih tinggi
- **MySQL/MariaDB** 8.0 atau lebih tinggi
- **Git** untuk version control

### 1. Clone Repository
```bash
git clone <URL_REPOSITORY>
cd App-E-Kuitansi
```

### 2. Setup Database
```sql
-- Buat database
CREATE DATABASE app_kwitansi;

-- Buat user database (opsional)
CREATE USER 'kuitansi_user'@'localhost' IDENTIFIED BY 'password_aman';
GRANT ALL PRIVILEGES ON app_kwitansi.* TO 'kuitansi_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Setup Backend
```bash
# Masuk ke direktori backend
cd BE/App-E-Kuitansi

# Buat virtual environment
python -m venv venv

# Aktifkan virtual environment
# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export FLASK_APP=main.py
export JWT_SECRET_KEY="kunci_rahasia_sangat_kuat"
export DEV_MODE="True"

# Jalankan backend
flask run
```

### 4. Setup Frontend
```bash
# Buka terminal baru dan masuk ke direktori frontend
cd FE/App-E-Kuitansi

# Install dependencies
npm install

# Jalankan frontend
npm start
```

### 5. Akses Aplikasi
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📚 Dokumentasi

### Frontend Documentation
Dokumentasi lengkap untuk aplikasi React.js frontend:
- **[Frontend README](FE/App-E-Kuitansi/README.md)** - Setup, konfigurasi, dan penggunaan
- **Komponen**: Dokumentasi semua React components
- **Routing**: Konfigurasi React Router
- **State Management**: Pengelolaan state aplikasi

### Backend Documentation
Dokumentasi lengkap untuk Flask API backend:
- **[Backend README](BE/App-E-Kuitansi/README.md)** - Setup, konfigurasi, dan API reference
- **API Endpoints**: Dokumentasi semua REST API endpoints
- **Database Models**: Schema dan relasi database
- **Authentication**: Sistem JWT dan role-based access

### API Reference

#### Base URLs
- **Development**: `http://localhost:5000`
- **Production**: `https://your-api-domain.com`

#### Authentication
```bash
# Login untuk mendapatkan token
POST /users/login
{
  "email_nik": "user@example.com",
  "password": "password"
}

# Gunakan token di header
Authorization: Bearer <jwt_token>
```

#### Core Endpoints
| Method | Endpoint | Deskripsi | Role Required |
|--------|----------|-----------|---------------|
| POST | `/users/login` | Login pengguna | Public |
| GET | `/users/get_users` | Daftar semua pengguna | Admin |
| POST | `/users/create_user` | Tambah pengguna baru | Admin |
| GET | `/kuitansi/all_kuitansi` | Daftar semua kuitansi | All |
| POST | `/kuitansi/create_kuitansi` | Buat kuitansi baru | ISE |
| GET | `/kuitansi/cetak_pdf/<id>` | Download PDF kuitansi | Based on Role |

## 🌐 Deployment

### Development Environment
```bash
# Jalankan dengan Docker Compose
docker-compose up -d

# Atau jalankan manual
# Terminal 1: Backend
cd BE/App-E-Kuitansi && flask run

# Terminal 2: Frontend
cd FE/App-E-Kuitansi && npm start
```

### Production Deployment

#### 1. Frontend (Build & Deploy)
```bash
cd FE/App-E-Kuitansi
npm run build

# Deploy ke web server (nginx, apache, dll)
# Atau deploy ke platform seperti Vercel, Netlify
```

#### 2. Backend (Production Server)
```bash
cd BE/App-E-Kuitansi

# Install production dependencies
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 main:app
```

#### 3. Database Production
```bash
# Setup MySQL production server
# Configure backup dan monitoring
# Setup SSL/TLS untuk koneksi database
```

### Environment Variables Production
```bash
# Backend
export FLASK_ENV=production
export DEV_MODE=False
export JWT_SECRET_KEY="super_secure_production_key"
export DATABASE_URL="mysql+pymysql://user:pass@host/db"

# Frontend
REACT_APP_API_BASE_URL=https://api.yourdomain.com
REACT_APP_ENV=production
```

## 🔧 Troubleshooting

### Masalah Umum

#### 1. Database Connection Error
```bash
# Periksa status MySQL
systemctl status mysql

# Test koneksi database
mysql -u root -p -e "SHOW DATABASES;"
```

#### 2. CORS Issues
```javascript
// Update CORS configuration di backend
CORS(app, origins=['http://localhost:3000', 'https://yourdomain.com'])
```

#### 3. JWT Token Problems
```bash
# Periksa JWT secret key
echo $JWT_SECRET_KEY

# Periksa log aplikasi
tail -f app.log | grep "JWT"
```

#### 4. NPM Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules dan reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Kontribusi

Kami menyambut kontribusi dari komunitas! Berikut cara berkontribusi:

### 1. Fork & Clone
```bash
git clone https://github.com/yourusername/App-E-Kuitansi.git
cd App-E-Kuitansi
```

### 2. Buat Branch Feature
```bash
git checkout -b feature/fitur-baru
```

### 3. Development Guidelines
- **Code Style**: Ikuti best practices React.js dan Flask
- **Testing**: Tulis unit tests untuk fitur baru
- **Documentation**: Update dokumentasi untuk perubahan API
- **Commit Messages**: Gunakan conventional commit format

### 4. Submit Pull Request
```bash
git add .
git commit -m "feat: tambah fitur baru"
git push origin feature/fitur-baru
```

### 5. Review Process
- Code review oleh maintainers
- Testing di environment staging
- Merge ke branch main setelah approval

## 📋 Roadmap

### Version 1.1 (Q2 2024)
- [ ] Dashboard analytics dan reporting
- [ ] Export data ke Excel/CSV
- [ ] Email notifications
- [ ] Mobile responsive improvements

### Version 1.2 (Q3 2024)
- [ ] Multi-tenant support
- [ ] Advanced search dengan Elasticsearch
- [ ] Audit log yang lebih detail
- [ ] API rate limiting

### Version 2.0 (Q4 2024)
- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Advanced reporting & charts
- [ ] Integration dengan sistem eksternal

## 📞 Dukungan

### Cara Mendapatkan Bantuan
- **Issues**: Laporkan bug atau request fitur di [GitHub Issues](issues)
- **Discussions**: Diskusi komunitas di [GitHub Discussions](discussions)
- **Documentation**: Cek dokumentasi lengkap di folder `docs/`
- **Email**: Hubungi tim development

### FAQ
**Q: Bagaimana cara reset password pengguna?**
A: Admin dapat menggunakan endpoint `PATCH /users/edit_user/<id>` untuk update password pengguna.

**Q: Apakah bisa menggunakan database selain MySQL?**
A: Ya, aplikasi mendukung PostgreSQL dan SQLite dengan konfigurasi SQLAlchemy yang sesuai.

**Q: Bagaimana cara backup data kuitansi?**
A: Gunakan mysqldump untuk backup database dan simpan file PDF kuitansi secara terpisah.

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE) - lihat file LICENSE untuk detail lengkap.

## 🙏 Acknowledgments

- **React.js Community** untuk framework frontend yang luar biasa
- **Flask Community** untuk micro-framework Python yang powerful
- **Contributors** yang telah membantu pengembangan proyek ini
- **Beta Testers** yang memberikan feedback berharga

---

<div align="center">
  <p>Dibuat dengan ❤️ untuk digitalisasi proses bisnis Indonesia</p>
  <p><strong>App E-Kuitansi v1.0.0</strong></p>
  
  <p>
    <a href="https://github.com/yourusername/App-E-Kuitansi">⭐ Star di GitHub</a> •
    <a href="https://github.com/yourusername/App-E-Kuitansi/issues">🐛 Laporkan Bug</a> •
    <a href="https://github.com/yourusername/App-E-Kuitansi/discussions">💬 Diskusi</a>
  </p>
  
  <p>
    <a href="#top">Kembali ke Atas ⬆️</a>
  </p>
</div>
