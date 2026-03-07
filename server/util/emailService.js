import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (user && pass && host) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return transporter;
}

export async function sendOtpEmail(toEmail, otp, subjectPrefix = 'Your OTP') {
  const subject = `${subjectPrefix} – Grazary Shop`;
  const html = `
    <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
      <h2 style="color: #2d5016;">Grazary Shop</h2>
      <p>Your one-time password (OTP) is:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #2d5016;">${otp}</p>
      <p style="color: #666;">This code expires in 10 minutes. Do not share it with anyone.</p>
    </div>
  `;
  const transport = getTransporter();
  if (transport) {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@grazary.com',
      to: toEmail,
      subject,
      html,
    });
    return true;
  }
  // No SMTP configured: log OTP to console (for development)
  console.log(`[OTP email not sent - no SMTP] To: ${toEmail} | OTP: ${otp}`);
  return false;
}
