const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const authMiddleware = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const leadsRoutes = require('./routes/leads');
const dealsRoutes = require('./routes/deals');
const tasksRoutes = require('./routes/tasks');
const notesRoutes = require('./routes/notes');
const analyticsRoutes = require('./routes/analytics');
const supportRoutes = require('./routes/support');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'MiniCRM SMM Pulse API працює.' });
});

app.use('/api/auth', authRoutes);

app.use('/api/leads', authMiddleware, leadsRoutes);
app.use('/api/deals', authMiddleware, dealsRoutes);
app.use('/api/tasks', authMiddleware, tasksRoutes);
app.use('/api/notes', authMiddleware, notesRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/support', authMiddleware, supportRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Сталася помилка сервера. Спробуйте пізніше.' });
});

app.listen(port, () => {
  console.log(`API запущено на порту ${port}`);
});
