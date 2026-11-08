import 'server-only';

import nodemailer from 'nodemailer';

// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, MAIL_FROM - see .env.example.
// Without SMTP_HOST (development only) the message is printed to the server console instead.
export const sendMail = async (to: string, subject: string, text: string): Promise<void> => {
  const host = process.env.SMTP_HOST;

  if (!host) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing environment variable: SMTP_HOST');
    }
    console.info(`\n[mail:dev] To: ${to}\nSubject: ${subject}\n${text}\n`);

    return;
  }

  const port = Number(process.env.SMTP_PORT ?? 587);
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });

  await transport.sendMail({
    from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
    to,
    subject,
    text,
  });
};
