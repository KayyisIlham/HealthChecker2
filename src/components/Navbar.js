'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import Link from 'next/link';
import { LayoutDashboard, Stethoscope, History, LogOut, Menu, X, ShieldAlert, MessageSquareWarning } from 'lucide-react';

export default function Navbar({ user }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const handleLogout = async () => {
    const a = getFirebaseAuth();
    if (a) await signOut(a);
    window.location.href = '/';
  };

  let links = [];

  if (isAdmin) {
    links = [
      { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { href: '/admin', label: 'Admin Panel', icon: <ShieldAlert size={18} color="var(--health-red)" /> },
    ];
  } else {
    links = [
      { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { href: '/check', label: 'Pemeriksaan', icon: <Stethoscope size={18} /> },
      { href: '/history', label: 'Riwayat', icon: <History size={18} /> },
      { href: '/pengaduan', label: 'Pengaduan', icon: <MessageSquareWarning size={18} color="var(--health-orange)" /> },
    ];
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href={user ? '/dashboard' : '/'} className="navbar-brand">
          <img src="/logo.png" alt="BIMHEAL Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          BIMHEAL
        </Link>

        <button className="navbar-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </div>

        {user && (
          <div className="navbar-user">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="navbar-avatar" referrerPolicy="no-referrer" />
            ) : (
              <div className="navbar-avatar" style={{
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '0.9rem'
              }}>
                {(user.displayName || user.email || '?')[0].toUpperCase()}
              </div>
            )}
            <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '8px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LogOut size={14} /> Keluar
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
