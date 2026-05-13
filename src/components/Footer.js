export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
          <img src="/logo.png" alt="BIMHEAL Logo" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
          <strong style={{ color: 'var(--text-primary)' }}>BIMHEAL</strong>
        </div>
        <p>Aplikasi Pemeriksaan Kesehatan Cerdas dengan Teknologi AI &copy; {new Date().getFullYear()}</p>
        <p style={{ marginTop: '8px', fontSize: '0.75rem', opacity: 0.6 }}>
          ⚠️ Disclaimer: Analisis AI ini bersifat informatif dan bukan pengganti saran medis profesional.
        </p>
      </div>
    </footer>
  );
}
