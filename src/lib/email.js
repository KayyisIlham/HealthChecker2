import nodemailer from 'nodemailer';

export async function sendSickNotification({ userName, userEmail, userPhone, complaintType, description, urgency, gender }) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS; // Gmail App Password
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  // If SMTP is not configured, warn and bypass
  if (!smtpUser || !smtpPass || !adminEmail) {
    console.warn('Email notification warning: SMTP credentials or admin email not configured in environment variables.');
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPass.replace(/\s+/g, ''),
    },
  });

  const mailOptions = {
    from: `"BIMHEAL Notification" <${smtpUser}>`,
    to: adminEmail,
    subject: `⚠️ PENGADUAN SAKIT BARU: ${userName} (${urgency.toUpperCase()})`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: ${urgency === 'darurat' ? '#ef4444' : urgency === 'sedang' ? '#eab308' : '#22c55e'}; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">Laporan Sakit / Pengaduan Baru</h2>
          <p style="margin: 5px 0 0; font-weight: bold; text-transform: uppercase;">Urgensi: ${urgency}</p>
        </div>
        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 150px; border-bottom: 1px solid #eee;">Nama Pengguna</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">: ${userName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #eee;">Email</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">: ${userEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #eee;">No. WhatsApp</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">: <a href="https://wa.me/62${userPhone}">+62${userPhone}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #eee;">Jenis Kelamin</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">: ${gender}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #eee;">Jenis Keluhan</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">: ${complaintType}</td>
            </tr>
          </table>

          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px; margin-bottom: 20px;">
            <strong style="display: block; margin-bottom: 8px;">Deskripsi Keluhan:</strong>
            <p style="margin: 0; white-space: pre-wrap;">${description}</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Buka Panel Admin BIMHEAL</a>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          Email ini dikirim secara otomatis oleh Sistem Pemantau BIMHEAL.
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Send email notification error:', error);
    return false;
  }
}
