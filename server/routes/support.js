const express = require('express');
const { sendSupportEmail } = require('../utils/mailer');

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Заповніть усі поля звернення.' });
  }

  try {
    await sendSupportEmail({ name, email, subject, message });
    return res.json({ message: 'Лист підтримці відправлено.' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Не вдалося відправити лист.' });
  }
});

module.exports = router;
