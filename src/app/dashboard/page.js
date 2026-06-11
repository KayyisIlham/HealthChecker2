'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HistoryChart from '@/components/HistoryChart';
import AIAdviceCard from '@/components/AIAdviceCard';
import Link from 'next/link';
import { Stethoscope, ClipboardList, TrendingUp, Ruler, Scale } from 'lucide-react';

function DashboardContent() {
  const [user, setUser] = useState(null);
  const [checks, setChecks] = useState([]);
  const [adminStats, setAdminStats] = useState({ users: [], complaints: [] });
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (u) => {
      if (u) {
        setUser(u);
        const adminEmailVal = u.email;
        const isUserAdmin = adminEmailVal === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

        if (isUserAdmin) {
          try {
            const [usersRes, complaintsRes] = await Promise.all([
              fetch(`/api/admin/users?adminEmail=${adminEmailVal}`),
              fetch(`/api/admin/pengaduan?adminEmail=${adminEmailVal}`),
            ]);
            const usersData = await usersRes.json();
            const complaintsData = await complaintsRes.json();
            setAdminStats({
              users: usersData.users || [],
              complaints: complaintsData.complaints || [],
            });
          } catch (err) { console.error(err); }
        } else {
          try {
            const res = await fetch(`/api/history?userId=${u.uid}&limit=10`);
            const data = await res.json();
            if (data.checks) setChecks(data.checks);
          } catch (err) { /* silent */ }
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner"></div><p>Memuat dashboard...</p></div>;

  const latest = checks[0];
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat Pagi';
    if (h < 15) return 'Selamat Siang';
    if (h < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const catColors = {
    kurus: '#3b82f6', normal: '#22c55e', gemuk: '#eab308', obesitas: '#ef4444',
  };

  if (isAdmin) {
    const pendingComplaints = adminStats.complaints.filter(c => c.status === 'menunggu');
    const highRiskUsers = adminStats.users.filter(u => u.latestCheck && (u.latestCheck.bmiCategoryKey === 'obesitas' || u.latestCheck.bloodPressureCategory.includes('Hipertensi')));

    return (
      <>
        <Navbar user={user} />
        <main className="dashboard container">
          <div className="dashboard-header animate-fade-in">
            <div>
              <h1>{greeting()}, Admin BIMHEAL</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Beranda pemantauan aktivitas kesehatan sistem dan tanggapan darurat.</p>
            </div>
            <Link href="/admin" className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}>
              Buka Panel Kontrol Admin
            </Link>
          </div>

          <div className="stats-grid animate-fade-in-up" style={{ marginBottom: '32px' }}>
            <div className="stat-card glass-card">
              <div className="stat-label">Total Anggota</div>
              <div className="stat-value" style={{ color: 'var(--accent-primary)' }}>{adminStats.users.length}</div>
              <div className="stat-desc">Pengguna terdaftar</div>
            </div>
            <div className="stat-card glass-card">
              <div className="stat-label">Pengaduan Aktif</div>
              <div className="stat-value" style={{ color: 'var(--health-yellow)' }}>{pendingComplaints.length}</div>
              <div className="stat-desc">Perlu tanggapan segera</div>
            </div>
            <div className="stat-card glass-card">
              <div className="stat-label">Risiko Tinggi</div>
              <div className="stat-value" style={{ color: 'var(--health-red)' }}>{highRiskUsers.length}</div>
              <div className="stat-desc">Pemeriksaan berisiko tinggi</div>
            </div>
            <div className="stat-card glass-card">
              <div className="stat-label">Tingkat Penanganan</div>
              <div className="stat-value" style={{ color: 'var(--health-green)', fontSize: '1.5rem' }}>
                {adminStats.complaints.length > 0 
                  ? `${Math.round((adminStats.complaints.filter(c => c.status === 'selesai').length / adminStats.complaints.length) * 100)}%` 
                  : '100%'}
              </div>
              <div className="stat-desc">Selesai ditangani</div>
            </div>
          </div>

          <div className="dashboard-admin-overview" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            {/* Urgensi Pengaduan */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🚨 Pengaduan Baru Menunggu
              </h3>
              {pendingComplaints.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Semua pengaduan kesehatan sudah ditangani.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pendingComplaints.slice(0, 5).map(c => (
                    <div key={c.id} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: `4px solid ${c.urgency === 'darurat' ? 'var(--health-red)' : 'var(--health-yellow)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                        <strong>{c.userName} ({c.gender === 'Laki-laki' ? 'L' : 'P'})</strong>
                        <span style={{ color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.complaintType}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{c.description.substring(0, 60)}...</div>
                    </div>
                  ))}
                  {pendingComplaints.length > 5 && (
                    <Link href="/admin" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textAlign: 'center', display: 'block', marginTop: '8px' }}>
                      Lihat {pendingComplaints.length - 5} Pengaduan Lainnya →
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Anggota Risiko Tinggi */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ Anggota Perlu Perhatian
              </h3>
              {highRiskUsers.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tidak ada anggota dengan kondisi berisiko tinggi saat ini.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {highRiskUsers.slice(0, 5).map(u => (
                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{u.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--health-red)' }}>{u.latestCheck.bmiCategory}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TD: {u.latestCheck.systolic}/{u.latestCheck.diastolic}</div>
                      </div>
                    </div>
                  ))}
                  {highRiskUsers.length > 5 && (
                    <Link href="/admin" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textAlign: 'center', display: 'block', marginTop: '8px' }}>
                      Lihat {highRiskUsers.length - 5} Anggota Lainnya →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar user={user} />
      <main className="dashboard container">
        <div className="dashboard-header animate-fade-in">
          <div>
            <h1>{greeting()}, {user?.displayName || user?.email?.split('@')[0] || 'User'} </h1>
            <p style={{ color: 'var(--text-secondary)' }}>Pantau kesehatan Anda dengan teknologi AI</p>
          </div>
          <Link href="/check" className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}>
            <Stethoscope size={18} /> Pemeriksaan Baru
          </Link>
        </div>

        <div className="stats-grid animate-fade-in-up">
          <div className="stat-card glass-card">
            <div className="stat-label">IMT Terakhir</div>
            <div className="stat-value" style={{ color: latest ? catColors[latest.bmiCategoryKey] : 'var(--text-primary)' }}>
              {latest ? latest.bmi : '—'}
            </div>
            <div className="stat-desc">{latest ? latest.bmiCategory : 'Belum ada data'}</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-label">Tekanan Darah</div>
            <div className="stat-value">
              {latest ? `${latest.systolic}/${latest.diastolic}` : '—'}
            </div>
            <div className="stat-desc">{latest ? latest.bloodPressureCategory : 'Belum ada data'}</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-label">Total Pemeriksaan</div>
            <div className="stat-value" style={{ color: 'var(--accent-primary)' }}>{checks.length}</div>
            <div className="stat-desc">Data tersimpan di cloud</div>
          </div>
          <div className="stat-card glass-card">
            <div className="stat-label">Terakhir Diperiksa</div>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>
              {latest ? new Date(latest.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '—'}
            </div>
            <div className="stat-desc">{latest ? `${latest.weight}kg / ${latest.height}cm` : 'Belum ada data'}</div>
          </div>
        </div>

        {checks.length > 1 && <HistoryChart data={checks} />}

        {latest && latest.aiAdvice && (
          <div style={{ marginBottom: '32px' }}>
            <AIAdviceCard advice={latest.aiAdvice} loading={false} />
          </div>
        )}

        {checks.length === 0 && (
          <div className="empty-state glass-card">
            <div className="empty-icon">
              <ClipboardList size={48} color="var(--text-muted)" />
            </div>
            <h3>Belum Ada Pemeriksaan</h3>
            <p>Mulai pemeriksaan pertama Anda untuk melihat analisis kesehatan lengkap.</p>
            <Link href="/check" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Mulai Pemeriksaan Sekarang
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

// Fix missing imports in the file I just wrote
import { getFirebaseAuth } from '@/lib/firebase';

export default function DashboardPage() {
  return <AuthGuard><DashboardContent /></AuthGuard>;
}
