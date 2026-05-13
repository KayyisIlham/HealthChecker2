'use client';

import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    try {
      setLoading(true);
      setError('');
      const a = getFirebaseAuth();
      await signInWithPopup(a, new GoogleAuthProvider());
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Gagal login dengan Google. Silakan coba lagi.');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const a = getFirebaseAuth();
      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(a, email, password);
        if (name) await updateProfile(cred.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(a, email, password);
      }
      window.location.href = '/dashboard';
    } catch (err) {
      const msgs = {
        'auth/email-already-in-use': 'Email sudah terdaftar.',
        'auth/invalid-email': 'Format email tidak valid.',
        'auth/weak-password': 'Password minimal 6 karakter.',
        'auth/user-not-found': 'Akun tidak ditemukan.',
        'auth/wrong-password': 'Password salah.',
        'auth/invalid-credential': 'Email atau password salah.',
      };
      setError(msgs[err.code] || 'Terjadi kesalahan. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card glass-card animate-fade-in">
        <img src="/logo.png" alt="BIMHEAL Logo" style={{ width: '64px', height: '64px', marginBottom: '16px', objectFit: 'contain' }} />
        <h1>{isRegister ? 'Daftar Akun BIMHEAL' : 'Selamat Datang di BIMHEAL'}</h1>
        <p className="login-subtitle">
          {isRegister ? 'Buat akun untuk mulai pemeriksaan kesehatan' : 'Masuk untuk memulai pemeriksaan kesehatan Anda'}
        </p>

        {error && (
          <div style={{
            padding: '12px 16px', background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)',
            color: '#ef4444', fontSize: '0.9rem', marginBottom: '20px', textAlign: 'left'
          }}>
            ⚠️ {error}
          </div>
        )}

        <button className="btn btn-google" onClick={handleGoogle} disabled={loading} style={{ width: '100%' }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? 'Memproses...' : 'Masuk dengan Google'}
        </button>

        <div className="login-divider">atau</div>

        <form onSubmit={handleEmailAuth}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input type="text" className="form-input" placeholder="Masukkan nama Anda"
                value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="contoh@email.com" required
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="Minimal 6 karakter" required minLength={6}
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
            {loading ? 'Memproses...' : isRegister ? 'Daftar' : 'Masuk'}
          </button>
        </form>

        <p style={{ marginTop: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
          <button onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: 'inherit' }}>
            {isRegister ? 'Masuk di sini' : 'Daftar sekarang'}
          </button>
        </p>
      </div>
    </div>
  );
}
