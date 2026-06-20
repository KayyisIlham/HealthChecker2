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
  Phone, Filter, Pill, PackagePlus, PackageMinus, 
  Trash2, Plus, CalendarClock, AlertOctagon, X
} from 'lucide-react';

function AdminContent() {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [medicineLogs, setMedicineLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [updatingId, setUpdatingId] = useState(null);

  // Form states for DSO
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [medicineForm, setMedicineForm] = useState({
    tanggalMasuk: new Date().toISOString().split('T')[0],
    sumber: '', namaObat: '', dosis: '', jumlah: '', expDate: ''
  });
  const [submittingMedicine, setSubmittingMedicine] = useState(false);

  // Form states for Obat Keluar
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    namaPasien: '', keluhan: '', diagnosa: '', obat: '', jumlah: '1', pemberiObat: ''
  });
  const [submittingLog, setSubmittingLog] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (u) => {
      if (u) {
        setUser(u);
        if (u.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
          try {
            const [usersRes, complaintsRes, medicinesRes, logsRes] = await Promise.all([
              fetch(`/api/admin/users?adminEmail=${u.email}`),
              fetch(`/api/admin/pengaduan?adminEmail=${u.email}`),
              fetch(`/api/admin/medicines?adminEmail=${u.email}`),
              fetch(`/api/admin/medicine-logs?adminEmail=${u.email}`),
            ]);
            const usersData = await usersRes.json();
            const complaintsData = await complaintsRes.json();
            const medicinesData = await medicinesRes.json();
            const logsData = await logsRes.json();
            if (usersData.users) setAllUsers(usersData.users);
            if (complaintsData.complaints) setComplaints(complaintsData.complaints);
            if (medicinesData.medicines) setMedicines(medicinesData.medicines);
            if (logsData.logs) setMedicineLogs(logsData.logs);
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

  // ===== FILTERS =====
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

  const filteredMedicines = medicines.filter(m => 
    !searchTerm || 
    m.namaObat.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.sumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.dosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = medicineLogs.filter(l => 
    !searchTerm || 
    l.namaPasien.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.obat.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.keluhan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.diagnosa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.pemberiObat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===== STATS =====
  const pendingCount = complaints.filter(c => c.status === 'menunggu').length;
  const daruratCount = complaints.filter(c => c.urgency === 'darurat' && c.status !== 'selesai').length;

  const today = new Date();
  const sixMonthsLater = new Date(today);
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

  const expiredMedicines = medicines.filter(m => new Date(m.expDate) < today);
  const nearExpMedicines = medicines.filter(m => {
    const ed = new Date(m.expDate);
    return ed >= today && ed <= sixMonthsLater;
  });

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const logsThisMonth = medicineLogs.filter(l => {
    const d = new Date(l.tanggal);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // ===== HELPERS =====
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

  const getEdStatus = (expDate) => {
    const ed = new Date(expDate);
    if (ed < today) return 'expired';
    if (ed <= sixMonthsLater) return 'warning';
    return 'safe';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  // ===== HANDLERS =====
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

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    setSubmittingMedicine(true);
    try {
      const res = await fetch('/api/admin/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: user.email, ...medicineForm }),
      });
      const data = await res.json();
      if (data.success) {
        setMedicines(prev => [{
          id: data.id,
          ...medicineForm,
          jumlah: medicineForm.jumlah ? parseInt(medicineForm.jumlah) : 0,
          createdAt: new Date().toISOString(),
          createdBy: user.email,
        }, ...prev]);
        setMedicineForm({
          tanggalMasuk: new Date().toISOString().split('T')[0],
          sumber: '', namaObat: '', dosis: '', jumlah: '', expDate: ''
        });
        setShowMedicineForm(false);
      }
    } catch (err) {
      console.error('Add medicine error:', err);
    } finally {
      setSubmittingMedicine(false);
    }
  };

  const handleDeleteMedicine = async (id) => {
    setDeletingId(id);
    try {
      const res = await fetch('/api/admin/medicines', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: user.email, medicineId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setMedicines(prev => prev.filter(m => m.id !== id));
      }
    } catch (err) {
      console.error('Delete medicine error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    setSubmittingLog(true);
    try {
      const res = await fetch('/api/admin/medicine-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: user.email, ...logForm }),
      });
      const data = await res.json();
      if (data.success) {
        setMedicineLogs(prev => [{
          id: data.id,
          ...logForm,
          jumlah: logForm.jumlah ? parseInt(logForm.jumlah) : 1,
          createdAt: new Date().toISOString(),
          createdBy: user.email,
        }, ...prev]);
        setLogForm({
          tanggal: new Date().toISOString().split('T')[0],
          namaPasien: '', keluhan: '', diagnosa: '', obat: '', jumlah: '1', pemberiObat: ''
        });
        setShowLogForm(false);
      }
    } catch (err) {
      console.error('Add medicine log error:', err);
    } finally {
      setSubmittingLog(false);
    }
  };

  const handleDeleteLog = async (id) => {
    setDeletingId(id);
    try {
      const res = await fetch('/api/admin/medicine-logs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: user.email, logId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setMedicineLogs(prev => prev.filter(l => l.id !== id));
      }
    } catch (err) {
      console.error('Delete medicine log error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const urgencyLabel = { ringan: '🟢 Ringan', sedang: '🟡 Sedang', darurat: '🔴 Darurat' };

  // Search placeholder by tab
  const searchPlaceholders = {
    users: 'Cari nama atau email pengguna...',
    complaints: 'Cari pengaduan...',
    medicines: 'Cari nama obat, sumber, atau dosis...',
    medicineLogs: 'Cari nama pasien, obat, keluhan...',
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
              <p>Pantau kesehatan seluruh pengguna dan kelola pengaduan & obat</p>
            </div>
          </div>
        </div>

        {/* Admin Tabs */}
        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => { setActiveTab('users'); setSearchTerm(''); }}
          >
            <Users size={18} /> Data Pengguna
            <span className="admin-tab-badge">{allUsers.length}</span>
          </button>
          <button 
            className={`admin-tab ${activeTab === 'complaints' ? 'active' : ''}`}
            onClick={() => { setActiveTab('complaints'); setSearchTerm(''); }}
          >
            <MessageSquareWarning size={18} /> Pengaduan
            {pendingCount > 0 && (
              <span className="admin-tab-badge" style={{ background: 'rgba(239,68,68,0.8)' }}>
                {pendingCount}
              </span>
            )}
          </button>
          <button 
            className={`admin-tab ${activeTab === 'medicines' ? 'active' : ''}`}
            onClick={() => { setActiveTab('medicines'); setSearchTerm(''); }}
          >
            <PackagePlus size={18} /> Stok Obat
            <span className="admin-tab-badge">{medicines.length}</span>
          </button>
          <button 
            className={`admin-tab ${activeTab === 'medicineLogs' ? 'active' : ''}`}
            onClick={() => { setActiveTab('medicineLogs'); setSearchTerm(''); }}
          >
            <PackageMinus size={18} /> Obat Keluar
            <span className="admin-tab-badge">{medicineLogs.length}</span>
          </button>
        </div>

        {/* Stats */}
        <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {activeTab === 'users' && (
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
          )}
          {activeTab === 'complaints' && (
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
          {activeTab === 'medicines' && (
            <>
              <div className="stat-card glass-card">
                <div className="stat-label">Total Jenis Obat</div>
                <div className="stat-value">{medicines.length}</div>
              </div>
              <div className="stat-card glass-card">
                <div className="stat-label">Segera Kadaluarsa</div>
                <div className="stat-value" style={{ color: 'var(--health-yellow)' }}>{nearExpMedicines.length}</div>
              </div>
              <div className="stat-card glass-card">
                <div className="stat-label">Sudah Kadaluarsa</div>
                <div className="stat-value" style={{ color: 'var(--health-red)' }}>{expiredMedicines.length}</div>
              </div>
            </>
          )}
          {activeTab === 'medicineLogs' && (
            <>
              <div className="stat-card glass-card">
                <div className="stat-label">Total Pencatatan</div>
                <div className="stat-value">{medicineLogs.length}</div>
              </div>
              <div className="stat-card glass-card">
                <div className="stat-label">Bulan Ini</div>
                <div className="stat-value" style={{ color: 'var(--health-blue)' }}>{logsThisMonth.length}</div>
              </div>
            </>
          )}
        </div>

        {/* Search & Filters & Add Button */}
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder={searchPlaceholders[activeTab]} 
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
            {activeTab === 'medicines' && (
              <button 
                className="btn btn-primary" 
                style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                onClick={() => setShowMedicineForm(true)}
              >
                <Plus size={18} /> Tambah Obat Masuk
              </button>
            )}
            {activeTab === 'medicineLogs' && (
              <button 
                className="btn btn-primary" 
                style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                onClick={() => setShowLogForm(true)}
              >
                <Plus size={18} /> Catat Obat Keluar
              </button>
            )}
          </div>

          {/* ===== USERS TAB ===== */}
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

          {/* ===== COMPLAINTS TAB ===== */}
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

          {/* ===== MEDICINES (DSO) TAB ===== */}
          {activeTab === 'medicines' && (
            <div>
              {filteredMedicines.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <Pill size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p>Belum ada data stok obat.</p>
                  <button 
                    className="btn btn-primary" 
                    style={{ marginTop: '16px' }}
                    onClick={() => setShowMedicineForm(true)}
                  >
                    <Plus size={16} /> Tambah Obat Pertama
                  </button>
                </div>
              ) : (
                <div className="history-table-wrap">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Tanggal Masuk</th>
                        <th>Sumber</th>
                        <th>Nama Obat</th>
                        <th>Dosis</th>
                        <th>Jumlah</th>
                        <th>Exp. Date</th>
                        <th>Status ED</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMedicines.map((m, idx) => {
                        const edStatus = getEdStatus(m.expDate);
                        return (
                          <tr key={m.id} className={edStatus === 'expired' ? 'row-expired' : edStatus === 'warning' ? 'row-warning' : ''}>
                            <td style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{idx + 1}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{formatDate(m.tanggalMasuk)}</td>
                            <td style={{ fontWeight: 500 }}>{m.sumber}</td>
                            <td style={{ fontWeight: 600 }}>{m.namaObat}</td>
                            <td>{m.dosis}</td>
                            <td style={{ fontWeight: 600 }}>{m.jumlah || '—'}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{formatDate(m.expDate)}</td>
                            <td>
                              <span className={`ed-badge ed-${edStatus}`}>
                                {edStatus === 'expired' && <><AlertOctagon size={12} /> Kadaluarsa</>}
                                {edStatus === 'warning' && <><CalendarClock size={12} /> Segera ED</>}
                                {edStatus === 'safe' && <><CheckCircle2 size={12} /> Aman</>}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn-icon-delete"
                                disabled={deletingId === m.id}
                                onClick={() => handleDeleteMedicine(m.id)}
                                title="Hapus data obat"
                              >
                                {deletingId === m.id ? '...' : <Trash2 size={16} />}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ===== MEDICINE LOGS (OBAT KELUAR) TAB ===== */}
          {activeTab === 'medicineLogs' && (
            <div>
              {filteredLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <PackageMinus size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p>Belum ada data obat keluar.</p>
                  <button 
                    className="btn btn-primary" 
                    style={{ marginTop: '16px' }}
                    onClick={() => setShowLogForm(true)}
                  >
                    <Plus size={16} /> Catat Obat Keluar Pertama
                  </button>
                </div>
              ) : (
                <div className="history-table-wrap">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Tanggal</th>
                        <th>Nama Pasien</th>
                        <th>Keluhan</th>
                        <th>Diagnosa</th>
                        <th>Obat</th>
                        <th>Jumlah</th>
                        <th>Pemberi Obat / Acc</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((l, idx) => (
                        <tr key={l.id}>
                          <td style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{idx + 1}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{formatDate(l.tanggal)}</td>
                          <td style={{ fontWeight: 600 }}>{l.namaPasien}</td>
                          <td style={{ maxWidth: '150px', fontSize: '0.85rem' }}>{l.keluhan}</td>
                          <td style={{ fontWeight: 500 }}>{l.diagnosa}</td>
                          <td style={{ fontWeight: 600 }}>{l.obat}</td>
                          <td style={{ fontWeight: 600 }}>{l.jumlah || '—'}</td>
                          <td style={{ fontWeight: 500, color: 'var(--accent-primary)' }}>{l.pemberiObat}</td>
                          <td>
                            <button 
                              className="btn-icon-delete"
                              disabled={deletingId === l.id}
                              onClick={() => handleDeleteLog(l.id)}
                              title="Hapus data obat keluar"
                            >
                              {deletingId === l.id ? '...' : <Trash2 size={16} />}
                            </button>
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

      {/* ===== MODAL: TAMBAH OBAT MASUK ===== */}
      {showMedicineForm && (
        <div className="modal-overlay" onClick={() => setShowMedicineForm(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><PackagePlus size={20} /> Tambah Obat Masuk (DSO)</h3>
              <button className="modal-close" onClick={() => setShowMedicineForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddMedicine} className="medicine-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tanggal Masuk</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={medicineForm.tanggalMasuk}
                    onChange={(e) => setMedicineForm(prev => ({ ...prev, tanggalMasuk: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sumber Obat</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Contoh: Apotek Mose, Puskesmas..."
                    value={medicineForm.sumber}
                    onChange={(e) => setMedicineForm(prev => ({ ...prev, sumber: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nama Obat</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Contoh: Paracetamol"
                    value={medicineForm.namaObat}
                    onChange={(e) => setMedicineForm(prev => ({ ...prev, namaObat: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Dosis Obat</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Contoh: 500mg"
                    value={medicineForm.dosis}
                    onChange={(e) => setMedicineForm(prev => ({ ...prev, dosis: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Jumlah</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="Contoh: 50"
                    min="0"
                    value={medicineForm.jumlah}
                    onChange={(e) => setMedicineForm(prev => ({ ...prev, jumlah: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tanggal Kadaluarsa (ED)</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={medicineForm.expDate}
                    onChange={(e) => setMedicineForm(prev => ({ ...prev, expDate: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMedicineForm(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={submittingMedicine}>
                  {submittingMedicine ? 'Menyimpan...' : <><Plus size={16} /> Simpan Data Obat</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: CATAT OBAT KELUAR ===== */}
      {showLogForm && (
        <div className="modal-overlay" onClick={() => setShowLogForm(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><PackageMinus size={20} /> Catat Obat Keluar</h3>
              <button className="modal-close" onClick={() => setShowLogForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddLog} className="medicine-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tanggal</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={logForm.tanggal}
                    onChange={(e) => setLogForm(prev => ({ ...prev, tanggal: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nama Pasien</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Nama penerima obat"
                    value={logForm.namaPasien}
                    onChange={(e) => setLogForm(prev => ({ ...prev, namaPasien: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Keluhan</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Contoh: Demam tinggi, pusing..."
                    value={logForm.keluhan}
                    onChange={(e) => setLogForm(prev => ({ ...prev, keluhan: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Diagnosa</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Contoh: Influenza, ISPA..."
                    value={logForm.diagnosa}
                    onChange={(e) => setLogForm(prev => ({ ...prev, diagnosa: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Obat yang Diberikan</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Contoh: Paracetamol 500mg"
                    value={logForm.obat}
                    onChange={(e) => setLogForm(prev => ({ ...prev, obat: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Jumlah</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="1"
                    min="1"
                    value={logForm.jumlah}
                    onChange={(e) => setLogForm(prev => ({ ...prev, jumlah: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Nama Pemberi Obat / Atas Acc Siapa</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Contoh: dr. Ahmad, Perawat Siti..."
                  value={logForm.pemberiObat}
                  onChange={(e) => setLogForm(prev => ({ ...prev, pemberiObat: e.target.value }))}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowLogForm(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={submittingLog}>
                  {submittingLog ? 'Menyimpan...' : <><Plus size={16} /> Simpan Data</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminPage() {
  return <AuthGuard><AdminContent /></AuthGuard>;
}
