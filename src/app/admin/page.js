'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Users, AlertTriangle, ShieldCheck, Search, 
  MessageSquareWarning, Clock, CheckCircle2, AlertCircle, 
  Phone, Filter
} from 'lucide-react';

function AdminContent() {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (u) => {
      if (u) {
        setUser(u);
        if (u.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
          try {
            const [usersRes, complaintsRes] = await Promise.all([
              fetch(`/api/admin/users?adminEmail=${u.email}`),
              fetch(`/api/admin/pengaduan?adminEmail=${u.email}`),
            ]);
            const usersData = await usersRes.json();
            const complaintsData = await complaintsRes.json();
            if (usersData.users) setAllUsers(usersData.users);
            if (complaintsData.complaints) setComplaints(complaintsData.complaints);
          } catch (err) { console.error(err); }
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner"></div><p>Memuat Data Admin...</p></div>;

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

  const filteredComplaints = complaints.filter(c => {
    const matchStatus = statusFilter === 'semua' || c.status === statusFilter;
    const matchSearch = !searchTerm || 
      (c.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.complaintType || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const pendingCount = complaints.filter(c => c.status === 'menunggu').length;
  const daruratCount = complaints.filter(c => c.urgency === 'darurat' && c.status !== 'selesai').length;

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

  const handleUpdateStatus = async (complaintId, newStatus) => {
    setUpdatingId(complaintId);
    try {
      const res = await fetch('/api/admin/pengaduan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: user.email,
          complaintId,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setComplaints(prev => prev.map(c => 
          c.id === complaintId ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c
        ));
      }
    } catch (err) {
      console.error('Update status error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const urgencyLabel = { ringan: '🟢 Ringan', sedang: '🟡 Sedang', darurat: '🔴 Darurat' };

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
              <p>Pantau kesehatan seluruh pengguna dan kelola pengaduan</p>
            </div>
          </div>
        </div>

        {/* Admin Tabs */}
        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} /> Data Pengguna
            <span className="admin-tab-badge">{allUsers.length}</span>
          </button>
          <button 
            className={`admin-tab ${activeTab === 'complaints' ? 'active' : ''}`}
            onClick={() => setActiveTab('complaints')}
          >
            <MessageSquareWarning size={18} /> Pengaduan
            {pendingCount > 0 && (
              <span className="admin-tab-badge" style={{ background: 'rgba(239,68,68,0.8)' }}>
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {activeTab === 'users' ? (
            <>
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
            </>
          ) : (
            <>
              <div className="stat-card glass-card">
                <div className="stat-label">Total Pengaduan</div>
                <div className="stat-value">{complaints.length}</div>
              </div>
              <div className="stat-card glass-card">
                <div className="stat-label">Menunggu</div>
                <div className="stat-value" style={{ color: 'var(--health-yellow)' }}>{pendingCount}</div>
              </div>
              <div className="stat-card glass-card">
                <div className="stat-label">Darurat Aktif</div>
                <div className="stat-value" style={{ color: 'var(--health-red)' }}>{daruratCount}</div>
              </div>
              <div className="stat-card glass-card">
                <div className="stat-label">Selesai</div>
                <div className="stat-value" style={{ color: 'var(--health-green)' }}>
                  {complaints.filter(c => c.status === 'selesai').length}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Search & Filters */}
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder={activeTab === 'users' ? 'Cari nama atau email pengguna...' : 'Cari pengaduan...'} 
                style={{ paddingLeft: '48px', width: '100%' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {activeTab === 'complaints' && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Filter size={16} color="var(--text-muted)" />
                {['semua', 'menunggu', 'ditangani', 'selesai'].map(s => (
                  <button 
                    key={s}
                    className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                    onClick={() => setStatusFilter(s)}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Users Tab Content */}
          {activeTab === 'users' && (
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
          )}

          {/* Complaints Tab Content */}
          {activeTab === 'complaints' && (
            <div>
              {filteredComplaints.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <MessageSquareWarning size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p>Tidak ada pengaduan{statusFilter !== 'semua' ? ` dengan status "${statusFilter}"` : ''}.</p>
                </div>
              ) : (
                <div className="history-table-wrap">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Pengguna</th>
                        <th>L/P</th>
                        <th>Keluhan</th>
                        <th>Deskripsi</th>
                        <th>Urgensi</th>
                        <th>Status</th>
                        <th>WhatsApp</th>
                        <th>Tanggal</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredComplaints.map(c => (
                        <tr key={c.id} style={c.urgency === 'darurat' && c.status === 'menunggu' ? { background: 'rgba(239,68,68,0.05)' } : {}}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{c.userName}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{c.userEmail}</div>
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>
                            {c.gender === 'Laki-laki' ? 'L' : c.gender === 'Perempuan' ? 'P' : '—'}
                          </td>
                          <td style={{ fontWeight: 500 }}>{c.complaintType}</td>
                          <td style={{ fontSize: '0.83rem', maxWidth: '200px' }}>
                            {c.description.length > 80 ? c.description.substring(0, 80) + '...' : c.description}
                          </td>
                          <td>
                            <span className={`urgency-badge ${c.urgency}`}>
                              {urgencyLabel[c.urgency]}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${c.status}`}>
                              {c.status === 'menunggu' && <Clock size={10} />}
                              {c.status === 'ditangani' && <AlertCircle size={10} />}
                              {c.status === 'selesai' && <CheckCircle2 size={10} />}
                              {' '}{c.status}
                            </span>
                          </td>
                          <td>
                            {c.userPhone && (
                              <a 
                                href={`https://wa.me/62${c.userPhone}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#25d366' }}
                              >
                                <Phone size={12} /> +62{c.userPhone}
                              </a>
                            )}
                          </td>
                          <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                            {new Date(c.createdAt).toLocaleDateString('id-ID', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                          </td>
                          <td>
                            <div className="complaint-actions">
                              {c.status === 'menunggu' && (
                                <button 
                                  className="btn btn-primary"
                                  disabled={updatingId === c.id}
                                  onClick={() => handleUpdateStatus(c.id, 'ditangani')}
                                >
                                  {updatingId === c.id ? '...' : 'Tangani'}
                                </button>
                              )}
                              {c.status === 'ditangani' && (
                                <button 
                                  className="btn btn-secondary" 
                                  style={{ borderColor: 'var(--health-green)', color: 'var(--health-green)' }}
                                  disabled={updatingId === c.id}
                                  onClick={() => handleUpdateStatus(c.id, 'selesai')}
                                >
                                  {updatingId === c.id ? '...' : '✓ Selesai'}
                                </button>
                              )}
                              {c.status === 'selesai' && (
                                <span style={{ fontSize: '0.8rem', color: 'var(--health-green)' }}>✓</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function AdminPage() {
  return <AuthGuard><AdminContent /></AuthGuard>;
}
