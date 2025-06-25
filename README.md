# App E-Kuitansi Backend

<div align="center">
  <h3>🚀 RESTful API for Digital Receipt Management</h3>
  <p>Robust backend service supporting comprehensive receipt and user management with JWT authentication</p>
  
  ![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
  ![Flask](https://img.shields.io/badge/Flask-2.0+-green.svg)
  ![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)
  ![JWT](https://img.shields.io/badge/JWT-Authentication-red.svg)
</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Requirements](#-system-requirements)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)

## 🎯 About

The E-Kuitansi Backend is a comprehensive RESTful API service built with Flask that provides secure and scalable backend support for digital receipt management. It features JWT-based authentication, role-based access control (RBAC), and automated PDF generation capabilities.

## ✨ Features

### 🔐 Authentication & Security

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Three-tier user roles (Admin, ISE, Officer)
- **Password Hashing**: Secure password storage with PBKDF2-SHA256
- **CORS Support**: Cross-origin resource sharing configuration

### 👥 User Management

- **CRUD Operations**: Complete user lifecycle management
- **Role Management**: Flexible role assignment and permissions
- **Profile Management**: User profile updates and maintenance

### 📄 Receipt Management

- **Digital Receipts**: Create, read, update, delete receipts
- **PDF Generation**: Automated PDF receipt generation with ReportLab
- **Data Validation**: Comprehensive input validation and sanitization
- **Audit Trail**: Track receipt modifications and access

### 🛠 Technical Features

- **Database ORM**: SQLAlchemy for robust database operations
- **Error Handling**: Comprehensive error handling and logging
- **Environment Configuration**: Flexible configuration management
- **Development Tools**: Built-in development utilities

## 🛠 Tech Stack

| Component           | Technology    | Version | Purpose                         |
| ------------------- | ------------- | ------- | ------------------------------- |
| **Framework**       | Flask         | 2.0+    | Web framework & API development |
| **Database ORM**    | SQLAlchemy    | 1.4+    | Database operations & modeling  |
| **Database**        | MySQL/MariaDB | 8.0+    | Primary data storage            |
| **Authentication**  | PyJWT         | 2.0+    | JWT token management            |
| **Security**        | Werkzeug      | 2.0+    | Password hashing & security     |
| **CORS**            | Flask-CORS    | 3.0+    | Cross-origin resource sharing   |
| **PDF Generation**  | ReportLab     | 3.6+    | Dynamic PDF creation            |
| **Database Driver** | PyMySQL       | 1.0+    | MySQL connectivity              |

## 💻 System Requirements

### Software Requirements

- **Python**: 3.8 or higher
- **pip**: 20.x or higher
- **MySQL/MariaDB**: 8.0 or higher

### Hardware Requirements

- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: 500MB free space
- **CPU**: 1 core minimum (2+ cores recommended)

## 🚀 Installation

### 1. Clone Repository

```bash
git clone <YOUR_BACKEND_REPO_URL>
cd App-E-Kuitansi/BE/App-E-Kuitansi
```

### 2. Set Up Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Verify Installation

```bash
pip list
```

## ⚙️ Configuration

### 1. Database Setup

```sql
-- Create database
CREATE DATABASE app_kwitansi;
CREATE USER 'kuitansi_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON app_kwitansi.* TO 'kuitansi_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```bash
# .env
FLASK_APP=main.py
FLASK_ENV=development
JWT_SECRET_KEY=your_super_secret_jwt_key_here
DEV_TOKEN=your_development_token_here
DEV_MODE=True
DATABASE_URL=mysql+pymysql://kuitansi_user:secure_password@localhost/app_kwitansi
```

### 3. Database Configuration

Update `config.py`:

```python
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'mysql+pymysql://root:@localhost/app_kwitansi')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'fallback-secret-key')
    DEV_MODE = os.getenv('DEV_MODE', 'False').lower() == 'true'
    DEV_TOKEN = os.getenv('DEV_TOKEN', 'dev-token')
```

### 4. Set Environment Variables

#### Windows (PowerShell)

```powershell
$env:FLASK_APP="main.py"
$env:JWT_SECRET_KEY="your_super_secret_jwt_key_here"
$env:DEV_TOKEN="your_development_token_here"
$env:DEV_MODE="True"
```

#### Windows (Command Prompt)

```cmd
set FLASK_APP=main.py
set JWT_SECRET_KEY=your_super_secret_jwt_key_here
set DEV_TOKEN=your_development_token_here
set DEV_MODE=True
```

#### macOS/Linux

```bash
export FLASK_APP=main.py
export JWT_SECRET_KEY="your_super_secret_jwt_key_here"
export DEV_TOKEN="your_development_token_here"
export DEV_MODE="True"
```

## 🎮 Running the Application

### Development Mode

```bash
flask run
```

### Production Mode

```bash
# Set production environment
export FLASK_ENV=production
export DEV_MODE=False

# Run with Gunicorn (recommended for production)
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 main:app
```

### Using Docker (Optional)

```bash
# Build Docker image
docker build -t ekuitansi-backend .

# Run container
docker run -p 5000:5000 ekuitansi-backend
```

## 📁 Project Structure

```
App-E-Kuitansi-Backend/
├── 📁 model/                 # Database models
│   ├── __init__.py
│   └── models.py            # User & Receipt models
├── 📁 route/                # API routes & blueprints
│   ├── __init__.py
│   ├── users.py             # User management endpoints
│   └── kuitansi.py          # Receipt management endpoints
├── 📁 utils/                # Utility functions
│   ├── __init__.py
│   ├── auth.py              # Authentication helpers
│   └── pdf_generator.py     # PDF generation utilities
├── 📄 config.py             # Application configuration
├── 📄 main.py               # Application entry point
├── 📄 requirements.txt      # Python dependencies
├── 📄 .env.example          # Environment variables template
├── 📄 Dockerfile            # Docker configuration
└── 📄 README.md             # This file
```

## 📚 API Documentation

### Base URL

```
http://localhost:5000
```

### Authentication Header

```
Authorization: Bearer <jwt_token>
```

### 🔐 Authentication Endpoints

#### POST `/users/login`

Authenticate user and return JWT token.

**Request:**

```json
{
  "email_nik": "user@example.com",
  "password": "secure_password"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Login successful",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "nama": "John Doe",
    "email_nik": "user@example.com",
    "role": "ISE"
  }
}
```

#### GET `/users/get_dev_token`

Get development token (DEV_MODE only).

**Response:**

```json
{
  "status": "success",
  "dev_token": "development_token_here"
}
```

### 👥 User Management Endpoints

#### GET `/users/get_users`

Get all users (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Response:**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "nama": "John Doe",
      "email_nik": "john@example.com",
      "role": "ISE",
      "created_at": "2024-01-01T10:00:00"
    }
  ]
}
```

#### POST `/users/create_user`

Create new user (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

**Request:**

```json
{
  "nama": "Jane Smith",
  "email_nik": "jane@example.com",
  "password": "secure_password",
  "role": "ISE"
}
```

#### PATCH `/users/edit_user/<int:id_user>`

Edit user details.

**Headers:** `Authorization: Bearer <token>`

**Request:**

```json
{
  "nama": "Updated Name",
  "email_nik": "updated@example.com",
  "role": "off3so"
}
```

#### DELETE `/users/delete_user/<int:id_user>`

Delete user (Admin only).

**Headers:** `Authorization: Bearer <admin_token>`

### 📄 Receipt Management Endpoints

#### GET `/kuitansi/all_kuitansi`

Get all receipts.

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "nomor_kuitansi": "KWT-001",
      "nama": "John Doe",
      "tanggal": "2024-01-01",
      "jumlah": 1000000.0,
      "terbilang": "Satu Juta Rupiah",
      "deskripsi": "Payment for services",
      "created_by": 1,
      "created_at": "2024-01-01T10:00:00"
    }
  ]
}
```

#### POST `/kuitansi/create_kuitansi`

Create new receipt (ISE only).

**Headers:** `Authorization: Bearer <ise_token>`

**Request:**

```json
{
  "nomor_kuitansi": "KWT-002",
  "nama": "Jane Smith",
  "tanggal": "2024-01-02",
  "jumlah": 2000000.0,
  "terbilang": "Dua Juta Rupiah",
  "deskripsi": "Consultation fee"
}
```

#### GET `/kuitansi/cetak_pdf/<int:id_kuitansi>`

Generate and download receipt PDF.

**Headers:** `Authorization: Bearer <token>`

**Response:** PDF file (Content-Type: application/pdf)

### 🔒 Role-Based Access Control

| Role                 | Permissions                                                              |
| -------------------- | ------------------------------------------------------------------------ |
| **Admin**            | Full access to all endpoints                                             |
| **ISE**              | Create receipts, edit own receipts, view receipts, download own receipts |
| **Officer (off3so)** | View all receipts, delete receipts, download receipts                    |

### 📊 HTTP Status Codes

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 500  | Internal Server Error |

## 🔒 Security

### JWT Configuration

```python
# JWT token expires in 24 hours
JWT_EXPIRATION_DELTA = timedelta(hours=24)

# Strong secret key (use environment variable)
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
```

### Password Security

```python
# PBKDF2-SHA256 hashing
from werkzeug.security import generate_password_hash, check_password_hash

password_hash = generate_password_hash(password, method='pbkdf2:sha256')
```

### CORS Configuration

```python
# Allow specific origins in production
CORS(app, origins=['http://localhost:3000', 'https://yourdomain.com'])
```

## 🌐 Deployment

### Production Checklist

- [ ] Set `FLASK_ENV=production`
- [ ] Set `DEV_MODE=False`
- [ ] Use strong `JWT_SECRET_KEY`
- [ ] Configure production database
- [ ] Set up proper CORS origins
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging

### Using Docker

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "main:app"]
```

### Using Docker Compose

```yaml
version: "3.8"
services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=mysql+pymysql://user:pass@db/app_kwitansi
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpass
      - MYSQL_DATABASE=app_kwitansi
    ports:
      - "3306:3306"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 style guide
- Write unit tests for new features
- Update documentation for API changes
- Use meaningful commit messages

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Error

```bash
# Check MySQL service status
systemctl status mysql

# Test database connection
mysql -u root -p -e "SHOW DATABASES;"
```

#### JWT Token Issues

```bash
# Verify JWT secret key is set
echo $JWT_SECRET_KEY

# Check token expiration in logs
tail -f app.log | grep "JWT"
```

#### CORS Issues

```python
# Add specific origin to CORS config
CORS(app, origins=['http://localhost:3000'])
```

### Debug Mode

```bash
# Enable Flask debug mode
export FLASK_DEBUG=1
flask run
```

### Logging

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📞 Support

For issues and questions:

- Create an issue on GitHub
- Check the [FAQ](docs/FAQ.md)
- Contact the development team

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ for efficient digital receipt management</p>
  <p><strong>E-Kuitansi Backend API v1.0.0</strong></p>
  
  <p>
    <a href="#top">Back to Top ⬆️</a>
  </p>
</div>
