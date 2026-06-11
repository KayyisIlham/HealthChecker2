'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  MessageSquareWarning,
  Send,
  Phone,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';

const COMPLAINT_TYPES = [
  'Demam / Suhu Tinggi',
  'Sakit Kepala',
  'Nyeri Dada',
  'Sesak Nafas',
  'Masalah Pencernaan',
  'Cedera / Luka',
  'Alergi',
  'Masalah Kulit',
  'Gangguan Mental / Stres',
  'Lainnya',
];

const URGENCY_OPTIONS = [
  { value: 'ringan', label: 'Ringan', icon: '💚', desc: 'Bisa ditangani nanti' },
  { value: 'sedang', label: 'Sedang', icon: '💛', desc: 'Perlu perhatian segera' },
  { value: 'darurat', label: 'Darurat', icon: '❤️‍🔥', desc: 'Butuh penanganan cepat' },
];

function WhatsAppIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function PengaduanContent() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    gender: '',
    complaintType: '',
    description: '',
    urgency: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null); // stores the submitted complaint data
  const [complaints, setComplaints] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (u) => {
      if (u) {
        setUser(u);
        try {
          const res = await fetch(`/api/pengaduan?userId=${u.uid}`);
          const data = await res.json();
          if (data.complaints) setComplaints(data.complaints);
        } catch (err) { /* silent */ }
      }
      setLoadingHistory(false);
    });
    return () => unsub();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !form.gender || !form.complaintType || !form.description || !form.urgency || !form.phone) {
      showToast('Mohon lengkapi semua field.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/pengaduan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userName: user.displayName || user.email?.split('@')[0] || '',
          userEmail: user.email || '',
          userPhone: form.phone,
          gender: form.gender,
          complaintType: form.complaintType,
          description: form.description,
          urgency: form.urgency,
        }),
      });
      const data = await res.json();
      if (data.id) {
        setSubmitted(data);
        setComplaints(prev => [data, ...prev]);
        showToast('✅ Pengaduan berhasil dikirim!');
      } else {
        showToast(data.error || 'Gagal mengirim pengaduan.', 'error');
      }
    } catch {
      showToast('Gagal mengirim pengaduan.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({ gender: '', complaintType: '', description: '', urgency: '', phone: '' });
    setSubmitted(null);
  };

  const buildWhatsAppMessage = (data) => {
    const urgencyLabel = { ringan: '🟢 Ringan', sedang: '🟡 Sedang', darurat: '🔴 DARURAT' };
    const msg = [
      `🏥 *PENGADUAN KESEHATAN BIMHEAL*`,
      `━━━━━━━━━━━━━━━━━━━`,
      ``,
      `👤 *Nama:* ${data.userName}`,
      `⚧️ *Jenis Kelamin:* ${data.gender}`,
      `📧 *Email:* ${data.userEmail}`,
      `📱 *WhatsApp:* ${data.userPhone}`,
      ``,
      `🩺 *Jenis Keluhan:* ${data.complaintType}`,
      `⚠️ *Urgensi:* ${urgencyLabel[data.urgency] || data.urgency}`,
      ``,
      `📝 *Deskripsi:*`,
      data.description,
      ``,
      `━━━━━━━━━━━━━━━━━━━`,
      `📅 ${new Date(data.createdAt).toLocaleString('id-ID')}`,
      `🆔 ID: ${data.id}`,
      ``,
      `_Dikirim melalui aplikasi BIMHEAL_`,
    ].join('\n');
    return encodeURIComponent(msg);
  };

  const getWhatsAppUrl = (data) => {
    let phone = '';
    if (data.gender === 'Laki-laki') {
      phone = process.env.NEXT_PUBLIC_HEALTH_TEAM_PHONE_MALE || '';
    } else if (data.gender === 'Perempuan') {
      phone = process.env.NEXT_PUBLIC_HEALTH_TEAM_PHONE_FEMALE || '';
    }
    const message = buildWhatsAppMessage(data);
    if (phone && !phone.includes('xxxx')) {
      return `https://wa.me/${phone}?text=${message}`;
    }
    // Fallback if env variable is not set correctly
    return `https://wa.me/?text=${message}`;
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      ringan: 'var(--health-green)',
      sedang: 'var(--health-yellow)',
      darurat: 'var(--health-red)',
    };
    return colors[urgency] || 'var(--text-muted)';
  };

  const getStatusLabel = (status) => {
    const labels = {
      menunggu: { text: 'Menunggu', icon: <Clock size={12} /> },
      ditangani: { text: 'Ditangani', icon: <AlertCircle size={12} /> },
      selesai: { text: 'Selesai', icon: <CheckCircle2 size={12} /> },
    };
    return labels[status] || labels.menunggu;
  };

  return (
    <>
      <Navbar user={user} />
      <main className="complaint-page container">
        <div className="section-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
          <h2>
            <MessageSquareWarning size={28} color="var(--health-red)" style={{ marginBottom: '-6px', marginRight: '8px' }} />
            Pengaduan Kesehatan
          </h2>
          <p>Laporkan keluhan kesehatan Anda dan dapatkan penanganan cepat dari tim kesehatan</p>
        </div>

        <div className="complaint-grid">
          {/* LEFT: Form */}
          <div className="complaint-form-section">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="glass-card complaint-form animate-fade-in">
                <h2 style={{ marginBottom: '24px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={20} color="var(--accent-primary)" /> Form Pengaduan
                </h2>

                {/* Jenis Kelamin */}
                <div className="form-group">
                  <label className="form-label">Jenis Kelamin</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      className="form-input"
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      required
                      style={{ appearance: 'none', paddingRight: '44px', cursor: 'pointer' }}
                    >
                      <option value="">— Pilih jenis kelamin —</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                    <ChevronDown size={18} color="var(--text-muted)" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>

                {/* Jenis Keluhan */}
                <div className="form-group">
                  <label className="form-label">Jenis Keluhan</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      className="form-input"
                      value={form.complaintType}
                      onChange={(e) => setForm({ ...form, complaintType: e.target.value })}
                      required
                      style={{ appearance: 'none', paddingRight: '44px', cursor: 'pointer' }}
                    >
                      <option value="">— Pilih jenis keluhan —</option>
                      {COMPLAINT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} color="var(--text-muted)" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>

                {/* Deskripsi */}
                <div className="form-group">
                  <label className="form-label">Deskripsi Keluhan</label>
                  <textarea
                    className="form-input"
                    placeholder="Jelaskan keluhan Anda secara detail: gejala yang dirasakan, sejak kapan, dll..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                    maxLength={1000}
                  />
                  <p className="form-hint">{form.description.length}/1000 karakter</p>
                </div>

                {/* Tingkat Urgensi */}
                <div className="form-group">
                  <label className="form-label">Tingkat Urgensi</label>
                  <div className="urgency-selector">
                    {URGENCY_OPTIONS.map(opt => (
                      <div className="urgency-option" key={opt.value}>
                        <input
                          type="radio"
                          name="urgency"
                          id={`urgency-${opt.value}`}
                          value={opt.value}
                          checked={form.urgency === opt.value}
                          onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                        />
                        <label htmlFor={`urgency-${opt.value}`} className={`urgency-${opt.value}`}>
                          <span className="urgency-icon">{opt.icon}</span>
                          <span>{opt.label}</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.7 }}>{opt.desc}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nomor WA */}
                <div className="form-group">
                  <label className="form-label">Nomor WhatsApp</label>
                  <div className="phone-input-wrap">
                    <span className="phone-prefix">+62</span>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="8123456789"
                      style={{ paddingLeft: '52px' }}
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                      required
                      maxLength={13}
                    />
                  </div>
                  <p className="form-hint">Nomor aktif untuk dihubungi tim kesehatan</p>
                </div>

                {/* Darurat Warning */}
                {form.urgency === 'darurat' && (
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '16px',
                    fontSize: '0.85rem',
                    color: 'var(--health-red)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <AlertTriangle size={16} />
                    Jika dalam keadaan darurat, segera hubungi 119 atau bawa ke UGD terdekat!
                  </div>
                )}

                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', gap: '10px' }}>
                  {submitting ? '⏳ Mengirim...' : <><Send size={18} /> Kirim Pengaduan</>}
                </button>
              </form>
            ) : (
              <div className="glass-card complaint-success animate-fade-in">
                <div className="success-icon">
                  <CheckCircle2 size={40} color="var(--health-green)" />
                </div>
                <h3>Pengaduan Berhasil Dikirim!</h3>
                <p>ID Pengaduan: <strong style={{ color: 'var(--accent-primary)' }}>{submitted.id}</strong></p>
                <p style={{ fontSize: '0.85rem', marginBottom: '24px' }}>
                  Kirim ringkasan pengaduan ke WhatsApp tim kesehatan agar segera ditangani.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <a
                    href={getWhatsAppUrl(submitted)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <WhatsAppIcon size={22} /> Kirim ke WhatsApp Tim Kesehatan
                  </a>
                  <button onClick={handleReset} className="btn btn-secondary" style={{ width: '100%', gap: '8px' }}>
                    <RotateCcw size={16} /> Buat Pengaduan Baru
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: History */}
          <div className="complaint-history-section">
            <div className="glass-card animate-fade-in-up" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="var(--accent-primary)" /> Riwayat Pengaduan
              </h3>

              {loadingHistory ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                  <p>Memuat riwayat...</p>
                </div>
              ) : complaints.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <MessageSquareWarning size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p>Belum ada pengaduan.</p>
                </div>
              ) : (
                <div>
                  {complaints.map((c, i) => (
                    <div key={c.id || i} className={`glass-card complaint-card urgent-${c.urgency}`}
                      style={{ padding: '16px 16px 16px 20px' }}>
                      <div className="complaint-meta">
                        <span className={`urgency-badge ${c.urgency}`}>
                          {c.urgency === 'ringan' ? '🟢' : c.urgency === 'sedang' ? '🟡' : '🔴'} {c.urgency}
                        </span>
                        {c.gender && (
                          <span className="status-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                            {c.gender === 'Laki-laki' ? '♂️ Laki-laki' : '♀️ Perempuan'}
                          </span>
                        )}
                        <span className={`status-badge ${c.status}`}>
                          {getStatusLabel(c.status).icon} {getStatusLabel(c.status).text}
                        </span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>
                        {c.complaintType}
                      </div>
                      <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '8px' }}>
                        {c.description.length > 100 ? c.description.substring(0, 100) + '...' : c.description}
                      </p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(c.createdAt).toLocaleString('id-ID', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </>
  );
}

export default function PengaduanPage() {
  return <AuthGuard><PengaduanContent /></AuthGuard>;
}
