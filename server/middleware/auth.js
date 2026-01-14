const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');

  if (!token) {
    return res.status(401).json({ message: 'Немає токена доступу. Увійдіть у систему.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Невірний або прострочений токен.' });
  }
};

module.exports = auth;
