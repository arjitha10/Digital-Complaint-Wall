const nodemailer = require('nodemailer');

let cachedTransporter;

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  if (hasSmtp) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    return cachedTransporter;
  }

  // Fallback to Ethereal for dev preview
  const testAccount = await nodemailer.createTestAccount();
  cachedTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  return cachedTransporter;
}

async function sendEmail({ to, subject, text, html }) {
  try {
    const transporter = await getTransporter();
    const from = process.env.EMAIL_FROM || 'no-reply@digitalcomplaintwall.com';
    
    const mailOptions = {
      from,
      to,
      subject,
      text,
      html
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    // For development with Ethereal, log the preview URL
    if (process.env.NODE_ENV === 'development') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('Email preview URL:', previewUrl);
      }
    }
    
    console.log('Email sent successfully:', info.messageId);
    return { 
      success: true, 
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
}

module.exports = { sendEmail };


