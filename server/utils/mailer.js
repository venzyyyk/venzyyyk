const nodemailer = require('nodemailer');

const createTransporter = () => {
  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT || 587);
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });
};

const sendSupportEmail = async ({ name, email, subject, message }) => {
  const transporter = createTransporter();
  if (!transporter) {
    throw new Error('Немає налаштувань SMTP. Заповніть MAIL_HOST, MAIL_USER, MAIL_PASS.');
  }

  const from = process.env.MAIL_FROM || process.env.MAIL_USER;
  const to = process.env.MAIL_USER;

  return transporter.sendMail({
    from,
    to,
    subject: `SMM Pulse Support: ${subject}`,
    text: `Від: ${name} <${email}>\n\n${message}`
  });
};

module.exports = {
  sendSupportEmail
};
