import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert2
import "./Login.css"; // Pastikan file CSS ini ada
import loginImage from "./assets/mdi_eye.png"; // Pastikan path benar
import loginImageOff from "./assets/mdi_eye-off.png"; // Pastikan path benar

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // State untuk indikator loading
  const [error, setError] = useState(""); // State untuk pesan error
  const navigate = useNavigate();

  // URL dasar API Anda
  const API_BASE_URL = "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Reset error message

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email_nik: email, password: password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login berhasil
        localStorage.setItem("token", data.token); // Simpan token di localStorage
        localStorage.setItem("userRole", data.user.role); // Simpan role di localStorage
        localStorage.setItem("userName", data.user.nama); // Simpan nama di localStorage
        localStorage.setItem("userEmailNik", data.user.email_nik); // Simpan email/nik di localStorage
        localStorage.setItem("userId", data.user.id_user); // Penting: Simpan ID pengguna untuk akses kontrol di frontend

        let timerInterval;
        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          html: `Selamat Datang ${data.user.nama}! Anda akan dialihkan dalam <b></b> detik.`, // Pesan selamat datang dari backend dengan placeholder hitungan mundur
          timer: 1500, // Durasi SweetAlert muncul (1.5 detik)
          timerProgressBar: true, // Aktifkan progress bar
          showConfirmButton: false, // Sembunyikan tombol konfirmasi
          didOpen: () => {
            Swal.showLoading(); // Tampilkan loading spinner bawaan SweetAlert
            const b = Swal.getHtmlContainer().querySelector("b");
            if (b) {
              // Pastikan elemen 'b' ada sebelum mencoba mengaksesnya
              timerInterval = setInterval(() => {
                const timeLeft = Swal.getTimerLeft();
                b.textContent = Math.ceil(timeLeft / 1000); // Update text with remaining seconds
              }, 100);
            }
          },
          willClose: () => {
            clearInterval(timerInterval); // Bersihkan interval timer
          },
        }).then((result) => {
          /* Read more about handling dismissals below */
          if (result.dismiss === Swal.DismissReason.timer) {
            console.log("I was closed by the timer");
          }
          // Setelah SweetAlert selesai, baru lakukan navigasi
          switch (data.user.role) {
            case "admin":
              navigate("/admin-dashboard/kuitansi"); // Sesuai dengan App.jsx yang dirapikan
              break;
            case "ISE": // Perhatikan case-sensitivity 'ISE'
              navigate("/ise-dashboard"); // Sesuai dengan App.jsx yang dirapikan
              break;
            case "off3so": // Perhatikan case-sensitivity 'off3so'
              navigate("/officer-dashboard"); // Sesuai dengan App.jsx yang dirapikan
              break;
            default:
              navigate("/"); // Fallback jika peran tidak dikenal
              break;
          }
        });
      } else {
        // Login gagal, tampilkan pesan error dari backend
        setError(data.message || "Login gagal. Silakan coba lagi.");
        Swal.fire({
          icon: "error",
          title: "Login Gagal!",
          text: data.message || "Email atau password salah. Silakan coba lagi.",
        });
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError(
        "Terjadi kesalahan jaringan atau server. Silakan coba lagi nanti."
      );
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan!",
        text: "Terjadi kesalahan jaringan atau server. Silakan coba lagi nanti.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Bagian Kiri */}
      <div className="login-left">
        <p className="welcome-text">Selamat datang di</p>
        <h1 className="font-bold">E-Kuitansi</h1>
        <p className="description">
          Solusi cerdas untuk semua kebutuhan kuitansi Anda. Kelola, lacak, dan
          arsipkan kuitansi dengan mudah dan aman bersama E-Kuitansi.
        </p>
      </div>

      {/* Bagian Kanan */}
      <div className="login-right">
        <h1 className="text-2xl font-bold">Masuk</h1>
        <p className="sub-title">Gunakan NIK/Email Anda</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="NIK/Email"
            className="login-input-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading} // Disable input saat loading
          />
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="login-input-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading} // Disable input saat loading
            />
            <img
              src={showPassword ? loginImageOff : loginImage}
              alt="Toggle Password"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>

          {error && (
            <p
              className="error-message"
              style={{ color: "red", marginTop: "10px" }}
            >
              {error}
            </p>
          )}

          <div className="button-login-container">
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Memuat..." : "Masuk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
