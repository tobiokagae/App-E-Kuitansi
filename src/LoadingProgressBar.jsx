// src/LoadingProgressBar.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom"; // useNavigationType juga bisa digunakan
import NProgress from "nprogress";
import "nprogress/nprogress.css"; // Jangan lupa import CSS-nya!

// Konfigurasi NProgress
NProgress.configure({
  showSpinner: false, // Sembunyikan spinner default
  ease: "ease", // Easing animasi
  speed: 500, // Kecepatan animasi (ini bukan total durasi)
  trickleSpeed: 200, // Seberapa sering memperbarui progress (efek "trickle")
  minimum: 0.1, // Persentase awal
  // Anda tidak dapat mengatur durasi total langsung di sini.
  // Durasi total dikendalikan oleh kapan NProgress.done() dipanggil.
});

const LoadingProgressBar = () => {
  const location = useLocation();

  useEffect(() => {
    // Setiap kali lokasi berubah (navigasi dimulai)
    NProgress.start();

    // Untuk memastikan progress bar setidaknya terlihat selama 1.5 detik
    // Anda bisa menunda NProgress.done()
    const MIN_DISPLAY_TIME = 1500; // 1.5 detik dalam milidetik
    let startTime = Date.now();

    const handleLoad = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = MIN_DISPLAY_TIME - elapsedTime;

      if (remainingTime > 0) {
        // Jika belum mencapai 1.5 detik, tunggu sisa waktunya
        setTimeout(() => {
          NProgress.done();
        }, remainingTime);
      } else {
        // Jika sudah lebih dari 1.5 detik, langsung selesaikan
        NProgress.done();
      }
    };

    // Panggil handleLoad setelah rendering awal halaman baru.
    // Ini mengasumsikan komponen halaman baru sudah mulai dirender.
    // Untuk skenario yang lebih akurat, Anda mungkin perlu menunggu
    // data di halaman selesai dimuat.
    // Dalam konteks ini, kita akan asumsikan komponen halaman itu sendiri cukup ringan
    // dan sebagian besar "loading" yang ingin Anda gambarkan adalah transisi atau render awal.
    handleLoad(); // Panggil segera setelah NProgress.start()

    // Cleanup: Ini penting jika komponen unmount sebelum timeout selesai
    return () => {
      NProgress.done(); // Pastikan NProgress selesai jika komponen di-unmount
    };
  }, [location]); // Re-run effect setiap kali `location` berubah

  return null; // Komponen ini tidak merender UI secara langsung
};

export default LoadingProgressBar;
