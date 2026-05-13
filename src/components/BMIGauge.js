'use client';

import { useEffect, useRef } from 'react';
import { getBMIGaugeAngle } from '@/lib/bmi';

export default function BMIGauge({ bmi, category }) {
  const needleRef = useRef(null);

  useEffect(() => {
    if (needleRef.current && bmi) {
      const angle = getBMIGaugeAngle(bmi);
      needleRef.current.style.transform = `rotate(${angle - 90}deg)`;
    }
  }, [bmi]);

  if (!bmi) return null;

  const catInfo = {
    kurus: { color: '#3b82f6', label: 'Kurus (Underweight)' },
    normal: { color: '#22c55e', label: 'Normal (Healthy)' },
    gemuk: { color: '#eab308', label: 'Gemuk (Overweight)' },
    obesitas: { color: '#ef4444', label: 'Obesitas (Obese)' },
  };

  const info = catInfo[category?.key] || catInfo.normal;

  return (
    <div className="bmi-gauge-container glass-card animate-fade-in">
      <h3 style={{ marginBottom: '16px', fontSize: '1rem', color: 'var(--text-muted)' }}>
        Indeks Massa Tubuh (IMT)
      </h3>
      <div className="bmi-gauge">
        <svg viewBox="0 0 240 130" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="30%" stopColor="#22c55e" />
              <stop offset="60%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <path d="M 20 120 A 100 100 0 0 1 220 120" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="16" strokeLinecap="round" />
          <path d="M 20 120 A 100 100 0 0 1 220 120" fill="none" stroke="url(#gaugeGrad)" strokeWidth="16" strokeLinecap="round" />
          <line ref={needleRef} x1="120" y1="120" x2="120" y2="30" stroke={info.color} strokeWidth="3" strokeLinecap="round"
            style={{ transformOrigin: '120px 120px', transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
          <circle cx="120" cy="120" r="8" fill={info.color} />
        </svg>
      </div>
      <div className="bmi-value" style={{ color: info.color }}>{bmi}</div>
      <div className={`bmi-category ${category?.key}`}>{info.label}</div>
    </div>
  );
}
