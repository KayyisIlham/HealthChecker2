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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (u) => {
      if (u) {
        setUser(u);
        try {
          const res = await fetch(`/api/history?userId=${u.uid}&limit=10`);
          const data = await res.json();
          if (data.checks) setChecks(data.checks);
        } catch (err) { /* silent */ }
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
