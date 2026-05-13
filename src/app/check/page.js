'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { calculateBMI, getBMICategory, getBloodPressureCategory } from '@/lib/bmi';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BMIGauge from '@/components/BMIGauge';
import BloodPressureCard from '@/components/BloodPressureCard';
import AIAdviceCard from '@/components/AIAdviceCard';
import { 
  Stethoscope, 
  Ruler, 
  Scale, 
  Activity, 
  ChevronRight, 
  RotateCcw, 
  Save, 
  BarChart3 
} from 'lucide-react';

function CheckContent() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ height: '', weight: '', systolic: '', diastolic: '' });
  const [result, setResult] = useState(null);
  const [aiAdvice, setAiAdvice] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null);

  // Real-time preview
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const h = parseFloat(form.height);
    const w = parseFloat(form.weight);
    if (h > 0 && w > 0) {
      const bmi = calculateBMI(w, h);
      const cat = getBMICategory(bmi);
      setPreview({ bmi, category: cat });
    } else {
      setPreview(null);
    }
  }, [form.height, form.weight]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const h = parseFloat(form.height);
    const w = parseFloat(form.weight);
    const sys = parseInt(form.systolic);
    const dia = parseInt(form.diastolic);

    const bmi = calculateBMI(w, h);
    const bmiCat = getBMICategory(bmi);
    const bpCat = getBloodPressureCategory(sys, dia);

    setResult({ bmi, bmiCategory: bmiCat, systolic: sys, diastolic: dia, bpCategory: bpCat });
    setAiAdvice('');
    setAiLoading(true);
    setSaved(false);

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.uid, 
          height: h, 
          weight: w, 
          systolic: sys, 
          diastolic: dia,
          name: user.displayName || user.email.split('@')[0],
          email: user.email
        }),
      });
      const data = await res.json();
      if (data.aiAdvice) {
        setAiAdvice(data.aiAdvice);
        setSaved(true);
        showToast('✅ Data berhasil disimpan!');
      } else if (data.error) {
        showToast(data.error, 'error');
      }
    } catch {
      showToast('Gagal menyimpan data.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ height: '', weight: '', systolic: '', diastolic: '' });
    setResult(null);
    setAiAdvice('');
    setSaved(false);
    setPreview(null);
  };

  return (
    <>
      <Navbar user={user} />
      <main className="check-page container">
        <div className="section-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
          <h2><Stethoscope size={28} color="var(--health-green)" style={{ marginBottom: '-6px', marginRight: '8px' }} /> Pemeriksaan Kesehatan</h2>
          <p>Masukkan data vital Anda untuk mendapatkan analisis kesehatan instan</p>
        </div>

        <div className="check-grid">
          <div className="check-form-section">
            <form onSubmit={handleSubmit} className="glass-card animate-fade-in">
              <h2 style={{ marginBottom: '24px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} color="var(--accent-primary)" /> Input Data Vital
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Tinggi Badan</label>
                  <div style={{ position: 'relative' }}>
                    <input type="number" className="form-input" placeholder="170" min="50" max="300" step="0.1" required
                      style={{ paddingLeft: '44px' }}
                      value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} />
                    <Ruler size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                  <p className="form-hint">Satuan: cm</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Berat Badan</label>
                  <div style={{ position: 'relative' }}>
                    <input type="number" className="form-input" placeholder="65" min="10" max="500" step="0.1" required
                      style={{ paddingLeft: '44px' }}
                      value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
                    <Scale size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                  <p className="form-hint">Satuan: kg</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Sistolik</label>
                  <input type="number" className="form-input" placeholder="120" min="50" max="300" required
                    value={form.systolic} onChange={(e) => setForm({ ...form, systolic: e.target.value })} />
                  <p className="form-hint">Tekanan atas (mmHg)</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Diastolik</label>
                  <input type="number" className="form-input" placeholder="80" min="30" max="200" required
                    value={form.diastolic} onChange={(e) => setForm({ ...form, diastolic: e.target.value })} />
                  <p className="form-hint">Tekanan bawah (mmHg)</p>
                </div>
              </div>

              {preview && (
                <div style={{
                  padding: '12px 16px', background: 'rgba(99,102,241,0.1)',
                  borderRadius: 'var(--radius-sm)', marginBottom: '16px',
                  fontSize: '0.9rem', color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <BarChart3 size={16} /> Preview IMT: <strong style={{ color: preview.category.color }}>{preview.bmi} — {preview.category.category}</strong>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving || aiLoading}
                  style={{ flex: 1, gap: '10px' }}>
                  {aiLoading ? '⏳ Menganalisis...' : <><Save size={18} /> Simpan & Analisis</>}
                </button>
                {result && (
                  <button type="button" className="btn btn-secondary" onClick={handleReset}>
                    <RotateCcw size={18} />
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="check-results-section">
            {result ? (
              <div className="animate-fade-in-up">
                <BMIGauge bmi={result.bmi} category={result.bmiCategory} />
                <div style={{ height: '20px' }}></div>
                <BloodPressureCard systolic={result.systolic} diastolic={result.diastolic} category={result.bpCategory} />
                <div style={{ height: '20px' }}></div>
                <AIAdviceCard advice={aiAdvice} loading={aiLoading} />
              </div>
            ) : (
              <div className="empty-state glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="empty-icon">
                  <Activity size={48} color="var(--text-muted)" />
                </div>
                <h3>Analisis Hasil</h3>
                <p>Isi formulir dan klik tombol simpan untuk melihat analisis IMT dan saran AI.</p>
              </div>
            )}
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

export default function CheckPage() {
  return <AuthGuard><CheckContent /></AuthGuard>;
}
