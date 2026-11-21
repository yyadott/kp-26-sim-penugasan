import emailjs from '@emailjs/browser';

// To use this, you need to create an account at https://www.emailjs.com/
// And replace these with your actual IDs.
// For now, these are placeholders that will log to console if not configured.

// TODO: Replace these with your actual EmailJS credentials
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_placeholder';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_placeholder';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'public_key_placeholder';

export interface EmailTemplateParams {
  to_email: string;
  to_name: string;
  nomor_surat: string;
  uraianKegiatan: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  lokasi: string;
  pesan_tambahan?: string;
}

export const sendEmailNotification = async (params: EmailTemplateParams) => {
  // Prevent actual API call if credentials are not set (during development/mocking)
  if (SERVICE_ID === 'service_placeholder') {
    console.log('--- MOCK EMAILJS NOTIFICATION ---');
    console.log('Sending email to:', params.to_email);
    console.log('Content:', params);
    console.log('Please set VITE_EMAILJS_SERVICE_ID in your .env file to send real emails.');
    console.log('---------------------------------');
    return { status: 200, text: 'Mock email sent successfully (check console)' };
  }

  try {
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      params as unknown as Record<string, unknown>,
      PUBLIC_KEY
    );
    console.log('Email sent successfully!', response.status, response.text);
    return response;
  } catch (error) {
    console.error('Failed to send email.', error);
    throw error;
  }
};
