'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Users, AlertTriangle, ShieldCheck, Search, ArrowUpDown, ExternalLink } from 'lucide-react';

function AdminContent() {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (u) => {
      if (u) {
        setUser(u);
        // Cek apakah admin
        if (u.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
          try {
            const res = await fetch(`/api/admin/users?adminEmail=${u.email}`);
            const data = await res.json();
            if (data.users) setAllUsers(data.users);
          } catch (err) { console.error(err); }
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner"></div><p>Memuat Data Admin...</p></div>;

  // Jika bukan admin, jangan tampilkan apa-apa (akan diredirect/dihandle UI)
  if (user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
        <AlertTriangle size={64} color="var(--health-red)" style={{ marginBottom: '20px' }} />
        <h1>Akses Ditolak</h1>
        <p>Hanya akun Administrator yang dapat mengakses halaman ini.</p>
        <a href="/dashboard" className="btn btn-primary" style={{ marginTop: '20px' }}>Kembali ke Dashboard</a>
      </div>
    );
  }

  const filteredUsers = allUsers.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (check) => {
    if (!check) return { text: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', status: 'BELUM ADA DATA' };
    
    const isHighRisk = check.bmiCategoryKey === 'obesitas' || check.bloodPressureCategory.includes('Hipertensi');
    const isOverweight = check.bmiCategoryKey === 'gemuk' || check.bloodPressureCategory.includes('Prehipertensi');
    const isUnderweight = check.bmiCategoryKey === 'kurus';

    if (isHighRisk) {
      return { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', status: 'PERHATIAN KHUSUS' };
    }
    if (isOverweight) {
      return { text: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', status: 'RISIKO SEDANG' };
    }
    if (isUnderweight) {
      return { text: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', status: 'KURANG BERAT' };
    }
    return { text: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', status: 'NORMAL' };
  };

  return (
    <>
      <Navbar user={user} />
      <main className="admin-page container">
        <div className="section-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--accent-primary)', padding: '10px', borderRadius: '12px', color: 'white' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2>Panel Kontrol Admin BIMHEAL</h2>
              <p>Pantau kesehatan seluruh pengguna dan identifikasi risiko tinggi</p>
            </div>
          </div>
        </div>

        <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div className="stat-card glass-card">
            <div className="stat-label">Total Pengguna</div>
            <div className="stat-value">{allUsers.length}</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-label">Perlu Perhatian</div>
            <div className="stat-value" style={{ color: 'var(--health-red)' }}>
              {allUsers.filter(u => u.latestCheck && (u.latestCheck.bmiCategoryKey === 'obesitas' || u.latestCheck.bloodPressureCategory.includes('Hipertensi'))).length}
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Cari nama atau email pengguna..." 
              style={{ paddingLeft: '48px', width: '100%', maxWidth: '400px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Pengguna</th>
                  <th>Email</th>
                  <th>IMT (Kategori)</th>
                  <th>Tensi (Kategori)</th>
                  <th>Status Risiko</th>
                  <th>Tgl Periksa</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ fontSize: '0.85rem', opacity: 0.8 }}>{u.email}</td>
                    <td style={{ fontWeight: 700, color: getStatusColor(u.latestCheck).text }}>
                      {u.latestCheck ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{u.latestCheck.bmi}</span>
                          <span style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 400 }}>({u.latestCheck.bmiCategory})</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td>
                      {u.latestCheck ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{u.latestCheck.systolic}/{u.latestCheck.diastolic}</span>
                          <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>({u.latestCheck.bloodPressureCategory})</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td>
                      {u.latestCheck ? (
                        <span className="history-badge" style={{ 
                          background: getStatusColor(u.latestCheck).bg, 
                          color: getStatusColor(u.latestCheck).text,
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          padding: '4px 10px',
                          border: `1px solid ${getStatusColor(u.latestCheck).text}44`
                        }}>
                          {getStatusColor(u.latestCheck).status}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Belum Ada Data</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {u.latestCheck ? new Date(u.latestCheck.createdAt).toLocaleDateString('id-ID') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function AdminPage() {
  return <AuthGuard><AdminContent /></AuthGuard>;
}
