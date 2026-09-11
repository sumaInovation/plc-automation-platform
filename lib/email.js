import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'PLC Automation <orders@sumaautomation.lk>';

export async function sendEmail({ to, subject, html, attachments }) {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      ...(attachments ? { attachments } : {}),
    });
    return { success: true, result };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error: error.message };
  }
}