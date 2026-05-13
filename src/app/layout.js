import './globals.css';

export const metadata = {
  title: 'BIMHEAL — Pemeriksaan Kesehatan Cerdas',
  description: 'Aplikasi pemeriksaan Indeks Massa Tubuh (IMT) dan tekanan darah dengan saran AI untuk hidup lebih sehat.',
  keywords: 'IMT, BMI, kesehatan, tekanan darah, BIMHEAL, health checker, AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
