'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HistoryChart from '@/components/HistoryChart';
import AIAdviceCard from '@/components/AIAdviceCard';
import { 
  History, 
  Trash2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Search,
  Calendar,
  Filter
} from 'lucide-react';

function HistoryContent() {
  const [user, setUser] = useState(null);
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHistory = async (u) => {
    try {
      const res = await fetch(`/api/history?userId=${u.uid}&limit=50`);
      const data = await res.json();
      if (data.checks) setChecks(data.checks);
    } catch (err) { /* silent */ }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (u) => {
      if (u) {
        setUser(u);
        await fetchHistory(u);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDeleteAll = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus SELURUH riwayat pemeriksaan? Tindakan ini tidak dapat dibatalkan.')) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/history/delete?userId=${user.uid}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.message) {
        setChecks([]);
        setSelected(null);
        alert('✅ Semua riwayat berhasil dibersihkan.');
      }
    } catch (err) {
      alert('Gagal menghapus riwayat.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner"></div><p>Memuat riwayat...</p></div>;

  const catColors = {
    kurus: { bg: 'rgba(59,130,246,0.2)', color: '#3b82f6' },
    normal: { bg: 'rgba(34,197,94,0.2)', color: '#22c55e' },
    gemuk: { bg: 'rgba(234,179,8,0.2)', color: '#eab308' },
    obesitas: { bg: 'rgba(239,68,68,0.2)', color: '#ef4444' },
  };

  return (
    <>
      <Navbar user={user} />
      <main className="history-page container">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2><History size={28} color="var(--health-yellow)" style={{ marginBottom: '-6px', marginRight: '8px' }} /> Riwayat Pemeriksaan</h2>
            <p>Lacak perkembangan kesehatan Anda dari waktu ke waktu</p>
          </div>
          {checks.length > 0 && (
            <button className="btn btn-danger" onClick={handleDeleteAll} disabled={deleting} style={{ padding: '10px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trash2 size={16} /> {deleting ? 'Menghapus...' : 'Bersihkan Data'}
            </button>
          )}
        </div>

        {checks.length > 1 && <HistoryChart data={checks} />}

        {checks.length > 0 ? (
          <div className="glass-card animate-fade-in" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="history-table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th><Calendar size={14} style={{ marginRight: '6px' }} /> Tanggal</th>
                    <th>Tinggi</th>
                    <th>Berat</th>
                    <th>IMT</th>
                    <th>Kategori</th>
                    <th>Tensi</th>
                    <th>Tekanan Darah</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {checks.map((c) => {
                    const cat = catColors[c.bmiCategoryKey] || catColors.normal;
                    return (
                      <tr key={c.id}>
                        <td style={{ fontSize: '0.8rem' }}>{new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td>{c.height} cm</td>
                        <td>{c.weight} kg</td>
                        <td style={{ fontWeight: 700, color: cat.color }}>{c.bmi}</td>
                        <td>
                          <span className="history-badge" style={{ background: cat.bg, color: cat.color }}>
                            {c.bmiCategory}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{c.systolic}/{c.diastolic}</td>
                        <td style={{ fontSize: '0.8rem' }}>{c.bloodPressureCategory}</td>
                        <td>
                          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                            onClick={() => setSelected(selected === c.id ? null : c.id)}>
                            {selected === c.id ? <ChevronUp size={14} /> : <><Sparkles size={14} /> Saran</>}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="empty-state glass-card">
            <div className="empty-icon">
              <Filter size={48} color="var(--text-muted)" />
            </div>
            <h3>Belum Ada Riwayat</h3>
            <p>Lakukan pemeriksaan pertama Anda untuk mulai mengumpulkan data kesehatan.</p>
          </div>
        )}

        {selected && (() => {
          const c = checks.find(ch => ch.id === selected);
          if (!c || !c.aiAdvice) return null;
          return (
            <div style={{ marginTop: '24px' }}>
              <div style={{ marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} /> Detail Saran AI untuk tanggal {new Date(c.createdAt).toLocaleDateString('id-ID')}
              </div>
              <div className="ai-advice-card glass-card animate-fade-in">
                <AIAdviceCard advice={c.aiAdvice} loading={false} />
              </div>
            </div>
          );
        })()}
      </main>
      <Footer />
    </>
  );
}

export default function HistoryPage() {
  return <AuthGuard><HistoryContent /></AuthGuard>;
}
