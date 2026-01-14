const express = require('express');
const { all, get, run } = require('../utils/db');

const router = express.Router();

router.get('/', (req, res) => {
  const { dealId, status, sort } = req.query;
  const filters = [];
  const params = {};

  if (dealId) {
    filters.push('tasks.dealId = @dealId');
    params.dealId = dealId;
  }

  if (status) {
    filters.push('tasks.status = @status');
    params.status = status;
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const order = sort === 'dueDate' ? 'ORDER BY date(tasks.dueDate) ASC' : 'ORDER BY datetime(tasks.createdAt) DESC';

  const items = all(
    `SELECT tasks.*, deals.package as dealPackage
     FROM tasks
     JOIN deals ON deals.id = tasks.dealId
     ${where}
     ${order}`,
    params
  );

  return res.json(items);
});

router.post('/', (req, res) => {
  const { dealId, title, type, status, dueDate } = req.body;

  if (!dealId || !title || !type || !status || !dueDate) {
    return res.status(400).json({ message: 'Заповніть усі обовʼязкові поля.' });
  }

  const deal = get('SELECT * FROM deals WHERE id = @id', { id: dealId });
  if (!deal) {
    return res.status(404).json({ message: 'Угода не знайдена.' });
  }

  const result = run(
    `INSERT INTO tasks (dealId, title, type, status, dueDate)
     VALUES (@dealId, @title, @type, @status, @dueDate)`,
    { dealId, title, type, status, dueDate }
  );

  const task = get('SELECT * FROM tasks WHERE id = @id', { id: result.lastInsertRowid });
  return res.status(201).json(task);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { dealId, title, type, status, dueDate } = req.body;

  if (!dealId || !title || !type || !status || !dueDate) {
    return res.status(400).json({ message: 'Заповніть усі обовʼязкові поля.' });
  }

  run(
    `UPDATE tasks
     SET dealId = @dealId,
         title = @title,
         type = @type,
         status = @status,
         dueDate = @dueDate
     WHERE id = @id`,
    { id, dealId, title, type, status, dueDate }
  );

  const task = get('SELECT * FROM tasks WHERE id = @id', { id });
  return res.json(task);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  run('DELETE FROM tasks WHERE id = @id', { id });
  return res.json({ message: 'Задачу видалено.' });
});

module.exports = router;
