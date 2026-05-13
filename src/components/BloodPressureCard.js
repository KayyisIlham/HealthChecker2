'use client';

export default function BloodPressureCard({ systolic, diastolic, category }) {
  if (!systolic || !diastolic) return null;

  return (
    <div className="bp-card glass-card animate-fade-in">
      <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>🩺 Tekanan Darah</h3>
      <div className="bp-display" style={{ color: category?.color || '#fff' }}>
        {systolic}<span>/</span>{diastolic} <span>mmHg</span>
      </div>
      <div className={`bp-category ${category?.key}`}>{category?.category}</div>
      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <div><strong>Sistolik</strong><br />{systolic} mmHg</div>
        <div style={{ width: '1px', background: 'var(--border-glass)' }}></div>
        <div><strong>Diastolik</strong><br />{diastolic} mmHg</div>
      </div>
    </div>
  );
}
