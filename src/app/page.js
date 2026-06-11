import Link from 'next/link';
import Footer from '@/components/Footer';
import { 
  ArrowRight, 
  Activity, 
  Scale, 
  Stethoscope, 
  Sparkles, 
  History as HistoryIcon, 
  ShieldCheck, 
  Smartphone,
  MessageSquareWarning 
} from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <img src="/logo.png" alt="BIMHEAL Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            BIMHEAL
          </div>
          <div className="navbar-links">
            <Link href="/login" className="btn btn-primary" style={{ padding: '10px 24px' }}>
              Mulai Sekarang <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-float"></div>
        <div className="hero-float"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <Activity size={16} color="var(--accent-primary)" /> 
            Powered by BIMHEAL AI Technology
          </div>
          <h1>
            Cek Kesehatan Anda<br />
            dengan <span className="gradient-text">BIMHEAL AI</span>
          </h1>
          <p>
            Periksa Indeks Massa Tubuh (IMT) dan tekanan darah Anda, lalu dapatkan
            saran kesehatan personal dari AI untuk hidup lebih sehat dan bugar.
          </p>
          <div className="hero-buttons">
            <Link href="/login" className="btn btn-primary btn-lg">
              <Stethoscope size={22} /> Mulai Pemeriksaan
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg">
              Pelajari Lebih Lanjut
            </a>
          </div>
        </div>
      </section>

      <section className="features container" id="features">
        <div className="section-header">
          <h2>Fitur Unggulan</h2>
          <p>Semua yang Anda butuhkan untuk memantau kesehatan dalam satu platform modern</p>
        </div>
        <div className="features-grid">
          <div className="feature-card glass-card">
            <div className="feature-icon">
              <Scale color="var(--health-blue)" />
            </div>
            <h3>Kalkulator IMT</h3>
            <p>Hitung Indeks Massa Tubuh berdasarkan tinggi dan berat badan dengan visual gauge interaktif.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon">
              <Stethoscope color="var(--health-red)" />
            </div>
            <h3>Monitor Tekanan Darah</h3>
            <p>Catat dan pantau tekanan darah sistolik & diastolik dengan kategorisasi otomatis.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon">
              <Sparkles color="var(--accent-primary)" />
            </div>
            <h3>Saran AI Personal</h3>
            <p>Dapatkan rekomendasi diet, olahraga, dan tips kesehatan dari AI berdasarkan data Anda.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon">
              <HistoryIcon color="var(--health-yellow)" />
            </div>
            <h3>Riwayat & Tren</h3>
            <p>Lacak perkembangan kesehatan Anda dari waktu ke waktu dengan grafik interaktif.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon">
              <ShieldCheck color="var(--health-green)" />
            </div>
            <h3>Aman & Privat</h3>
            <p>Data Anda tersimpan aman di Firebase dengan autentikasi Google dan enkripsi tingkat lanjut.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon">
              <MessageSquareWarning color="var(--health-orange)" />
            </div>
            <h3>Pengaduan Kesehatan</h3>
            <p>Laporkan keluhan kesehatan dan kirim langsung ke WhatsApp tim kesehatan untuk penanganan cepat.</p>
          </div>
          <div className="feature-card glass-card">
            <div className="feature-icon">
              <Smartphone color="var(--text-primary)" />
            </div>
            <h3>Responsif</h3>
            <p>Akses dari mana saja — desktop, tablet, atau smartphone dengan tampilan yang selalu optimal.</p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
