const express = require('express');
const jwt = require('jsonwebtoken');
const { get } = require('../utils/db');

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Вкажіть email та пароль.' });
  }

  const user = get('SELECT * FROM users WHERE email = @email', { email });

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Невірний email або пароль.' });
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '8h' }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

module.exports = router;
