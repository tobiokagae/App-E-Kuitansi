import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import loginImage from './assets/mdi_eye.png';
import loginImageOff from './assets/mdi_eye-off.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Cek email dan password
    if (email === 'nanda.pratama@telkom.co.id' && password === '12345') {
      navigate('/NandaDashboard'); // ← Arahkan ke halaman Nanda Dashboard
    } else if (email === 'admin@gmail.com' && password === 'admin') {
      navigate('/AdminDashboard/DaftarKuitansi'); // ← Arahkan ke halaman Admin Dashboard
    }
    else {
      alert('Email atau password salah!');
    }
  };

  return (
    <div className="login-container">
      
      {/* Bagian Kiri */}
      <div className="login-left">
        <p className="welcome-text">Selamat datang di</p>
        <h1 className="font-bold">E-Kuitansi</h1>
        <p className="description">
          Solusi cerdas untuk semua kebutuhan kuitansi Anda. Kelola, lacak, dan arsipkan kuitansi dengan mudah dan aman bersama E-Kuitansi.
        </p>
      </div>

      {/* Bagian Kanan */}
      <div className="login-right">
        <h1 className="text-2xl font-bold">Masuk</h1>
        <p className="sub-title">Gunakan NIK/Email Anda</p>

        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="NIK/Email" className="login-input-email" value={email} onChange={(e) => setEmail(e.target.value)}/>
          <div className="password-input-container">
            <input type={showPassword ? 'text' : 'password'} placeholder="Password" className="login-input-password" value={password} onChange={(e) => setPassword(e.target.value)}/>
            <img src={showPassword ? loginImageOff : loginImage} alt="Toggle Password" className="toggle-password" onClick={() => setShowPassword(!showPassword)}/>
          </div>

          <div className="button-login-container">
            <button type="submit" className="login-button">Masuk</button>
          </div>
        </form>
      </div>

    </div>
  );
}

export default Login;
