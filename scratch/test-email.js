const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

console.log('SMTP_USER:', smtpUser);
console.log('SMTP_PASS length:', smtpPass ? smtpPass.length : 0);
console.log('NEXT_PUBLIC_ADMIN_EMAIL:', adminEmail);

if (!smtpUser || !smtpPass) {
  console.error('SMTP credentials missing!');
  process.exit(1);
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
  from: `"BIMHEAL Test" <${smtpUser}>`,
  to: adminEmail || smtpUser, // Fallback to sender if adminEmail is not defined
  subject: 'Test Email BIMHEAL',
  text: 'Ini adalah email uji coba dari sistem BIMHEAL.',
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error sending email:', error);
  } else {
    console.log('Email sent successfully:', info.response);
  }
});
