const express = require('express');
const { all, get, run } = require('../utils/db');

const router = express.Router();

router.get('/', (req, res) => {
  const { entityType, entityId } = req.query;
  const filters = [];
  const params = {};

  if (entityType) {
    filters.push('notes.entityType = @entityType');
    params.entityType = entityType;
  }

  if (entityId) {
    filters.push('notes.entityId = @entityId');
    params.entityId = entityId;
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const items = all(
    `SELECT notes.*, users.name as authorName
     FROM notes
     JOIN users ON users.id = notes.authorId
     ${where}
     ORDER BY datetime(notes.createdAt) DESC`,
    params
  );

  return res.json(items);
});

router.post('/', (req, res) => {
  const { entityType, entityId, text, authorId } = req.body;

  if (!entityType || !entityId || !text || !authorId) {
    return res.status(400).json({ message: 'Заповніть усі обовʼязкові поля.' });
  }

  const author = get('SELECT * FROM users WHERE id = @id', { id: authorId });
  if (!author) {
    return res.status(404).json({ message: 'Автор не знайдений.' });
  }

  const result = run(
    `INSERT INTO notes (entityType, entityId, text, authorId)
     VALUES (@entityType, @entityId, @text, @authorId)`,
    { entityType, entityId, text, authorId }
  );

  const note = get('SELECT * FROM notes WHERE id = @id', { id: result.lastInsertRowid });
  return res.status(201).json(note);
});

module.exports = router;
