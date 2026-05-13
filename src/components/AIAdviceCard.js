'use client';

import ReactMarkdown from 'react-markdown';
import { Sparkles, AlertCircle } from 'lucide-react';

export default function AIAdviceCard({ advice, loading }) {
  return (
    <div className="ai-advice-card glass-card animate-fade-in">
      <div className="ai-advice-header">
        <Sparkles size={20} className="text-primary" style={{ color: 'var(--accent-primary)' }} /> 
        Saran AI untuk Kesehatan Anda
      </div>

      {loading ? (
        <div className="ai-loading">
          <div className="ai-loading-dots">
            <span></span> <span></span> <span></span>
          </div>
          <span>AI sedang menganalisis data Anda...</span>
        </div>
      ) : advice ? (
        <>
          <div className="ai-advice-content markdown-body">
            <ReactMarkdown>{advice}</ReactMarkdown>
          </div>
          <div className="ai-advice-disclaimer">
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>
              <strong>Disclaimer:</strong> Saran ini dihasilkan oleh AI dan bersifat informatif. Bukan pengganti konsultasi dengan dokter atau tenaga medis profesional.
            </span>
          </div>
        </>
      ) : (
        <p style={{ color: 'var(--text-muted)' }}>
          Lakukan pemeriksaan untuk mendapatkan saran kesehatan dari AI.
        </p>
      )}

      <style jsx global>{`
        .markdown-body {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.8;
        }
        .markdown-body p {
          margin-bottom: 16px;
        }
        .markdown-body strong {
          color: var(--text-primary);
          font-weight: 700;
        }
        .markdown-body ul, .markdown-body ol {
          margin-bottom: 16px;
          padding-left: 20px;
        }
        .markdown-body li {
          margin-bottom: 8px;
        }
        .markdown-body h1, .markdown-body h2, .markdown-body h3 {
          color: var(--text-primary);
          margin: 24px 0 12px;
          font-weight: 700;
        }
        .markdown-body h1 { font-size: 1.4rem; }
        .markdown-body h2 { font-size: 1.2rem; }
        .markdown-body h3 { font-size: 1.1rem; }
      `}</style>
    </div>
  );
}
