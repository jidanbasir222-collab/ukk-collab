const nodemailer = require("nodemailer");

let transporter = null;

// Buat transporter hanya jika SMTP dikonfigurasi
function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user, pass }
  });
  return transporter;
}

function isSmtpConfigured() {
  const pass = process.env.SMTP_PASS;
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    pass &&
    !pass.includes("ISI_APP_PASSWORD") // placeholder di .env dianggap belum dikonfigurasi
  );
}

// Kirim email OTP. Mengembalikan true jika terkirim, false jika SMTP belum dikonfigurasi.
async function sendOtpEmail(to, code, purpose) {
  const transport = getTransporter();
  if (!transport) return false;

  const subject =
    purpose === "reset"
      ? "Electric Pulse - Kode Verifikasi Reset Password"
      : "Electric Pulse - Kode Verifikasi Registrasi";

  const heading =
    purpose === "reset"
      ? "Reset Password Akun Anda"
      : "Verifikasi Registrasi Akun";

  const message =
    purpose === "reset"
      ? "Anda menerima email ini karena kami menerima permintaan reset password untuk akun Anda. Gunakan kode berikut untuk melanjutkan."
      : "Terima kasih telah mendaftar di Electric Pulse. Gunakan kode berikut untuk memverifikasi email Anda.";

  try {
    await transport.sendMail({
      from: `"Electric Pulse" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f4f6;padding:32px 16px;">
          <div style="max-width:420px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e5e9;">
            <div style="background:linear-gradient(135deg,#ff3b70,#8b5cf6);padding:24px;text-align:center;">
              <div style="font-size:20px;font-weight:bold;color:#ffffff;">⚡ Electric Pulse</div>
              <div style="color:rgba(255,255,255,0.85);font-size:12px;margin-top:4px;">${heading}</div>
            </div>
            <div style="padding:28px 24px;">
              <p style="color:#444;font-size:13px;line-height:1.6;margin:0 0 20px;">Halo,</p>
              <p style="color:#444;font-size:13px;line-height:1.6;margin:0 0 20px;">${message}</p>
              <div style="background:#f8f8fa;border:1px dashed #d0d0d8;border-radius:12px;padding:18px;text-align:center;letter-spacing:10px;font-size:28px;font-weight:bold;color:#111;font-family:monospace;">${code}</div>
              <p style="color:#888;font-size:12px;line-height:1.6;margin:20px 0 0;">Kode berlaku selama <strong>5 menit</strong> dan hanya bisa digunakan sekali. Jangan bagikan kode ini kepada siapa pun.</p>
            </div>
          </div>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error("Gagal mengirim email OTP:", error.message || error);
    return false;
  }
}

// Kirim email berisi tautan reset password. Mengembalikan true jika terkirim.
async function sendResetLinkEmail(to, resetUrl) {
  const transport = getTransporter();
  if (!transport) return false;

  try {
    await transport.sendMail({
      from: `"Electric Pulse" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: "Electric Pulse - Reset Password Anda",
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f4f6;padding:32px 16px;">
          <div style="max-width:420px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e5e9;">
            <div style="background:linear-gradient(135deg,#ff3b70,#8b5cf6);padding:24px;text-align:center;">
              <div style="font-size:20px;font-weight:bold;color:#ffffff;">⚡ Electric Pulse</div>
              <div style="color:rgba(255,255,255,0.85);font-size:12px;margin-top:4px;">Reset Password Akun Anda</div>
            </div>
            <div style="padding:28px 24px;">
              <p style="color:#444;font-size:13px;line-height:1.6;margin:0 0 20px;">Halo,</p>
              <p style="color:#444;font-size:13px;line-height:1.6;margin:0 0 20px;">Anda menerima email ini karena kami menerima permintaan reset password untuk akun Anda. Klik tombol di bawah untuk membuat password baru.</p>
              <div style="text-align:center;margin:24px 0;">
                <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#ff3b70,#8b5cf6);color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;padding:14px 32px;border-radius:12px;">Reset Password</a>
              </div>
              <p style="color:#888;font-size:12px;line-height:1.6;margin:0 0 8px;">Atau salin tautan berikut ke browser Anda:</p>
              <div style="background:#f8f8fa;border:1px dashed #d0d0d8;border-radius:12px;padding:12px;font-size:11px;color:#333;word-break:break-all;font-family:monospace;">${resetUrl}</div>
              <p style="color:#888;font-size:12px;line-height:1.6;margin:20px 0 0;">Tautan berlaku selama <strong>15 menit</strong> dan hanya bisa digunakan sekali. Jika Anda tidak meminta reset password, abaikan email ini.</p>
            </div>
          </div>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error("Gagal mengirim email reset password:", error.message || error);
    return false;
  }
}

module.exports = { sendOtpEmail, sendResetLinkEmail, isSmtpConfigured };
