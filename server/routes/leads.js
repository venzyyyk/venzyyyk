const express = require('express');
const { all, get, run } = require('../utils/db');

const router = express.Router();

const statusOrder = ['New', 'Contacted', 'Briefing', 'Proposal', 'Won', 'Lost'];

router.get('/', (req, res) => {
  const {
    status,
    source,
    ownerId,
    search,
    dateFrom,
    dateTo,
    minBudget,
    maxBudget
  } = req.query;

  const filters = [];
  const params = {};

  if (status) {
    filters.push('leads.status = @status');
    params.status = status;
  }

  if (source) {
    filters.push('leads.source = @source');
    params.source = source;
  }

  if (ownerId) {
    filters.push('leads.ownerId = @ownerId');
    params.ownerId = ownerId;
  }

  if (search) {
    filters.push('(leads.name LIKE @search OR leads.contact LIKE @search)');
    params.search = `%${search}%`;
  }

  if (dateFrom) {
    filters.push('date(leads.createdAt) >= date(@dateFrom)');
    params.dateFrom = dateFrom;
  }

  if (dateTo) {
    filters.push('date(leads.createdAt) <= date(@dateTo)');
    params.dateTo = dateTo;
  }

  if (minBudget) {
    filters.push('leads.estimatedBudget >= @minBudget');
    params.minBudget = Number(minBudget);
  }

  if (maxBudget) {
    filters.push('leads.estimatedBudget <= @maxBudget');
    params.maxBudget = Number(maxBudget);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const items = all(
    `SELECT leads.*, users.name as ownerName
     FROM leads
     JOIN users ON users.id = leads.ownerId
     ${where}
     ORDER BY datetime(leads.createdAt) DESC`,
    params
  );

  return res.json(items);
});

router.post('/', (req, res) => {
  const { name, contact, source, status, estimatedBudget, ownerId } = req.body;

  if (!name || !contact || !source || !status || !estimatedBudget || !ownerId) {
    return res.status(400).json({ message: 'Заповніть усі обовʼязкові поля.' });
  }

  const result = run(
    `INSERT INTO leads (name, contact, source, status, estimatedBudget, ownerId)
     VALUES (@name, @contact, @source, @status, @estimatedBudget, @ownerId)`,
    { name, contact, source, status, estimatedBudget, ownerId }
  );

  const lead = get('SELECT * FROM leads WHERE id = @id', { id: result.lastInsertRowid });
  return res.status(201).json(lead);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, contact, source, status, estimatedBudget, ownerId } = req.body;

  if (!name || !contact || !source || !status || !estimatedBudget || !ownerId) {
    return res.status(400).json({ message: 'Заповніть усі обовʼязкові поля.' });
  }

  run(
    `UPDATE leads
     SET name = @name,
         contact = @contact,
         source = @source,
         status = @status,
         estimatedBudget = @estimatedBudget,
         ownerId = @ownerId
     WHERE id = @id`,
    { id, name, contact, source, status, estimatedBudget, ownerId }
  );

  const lead = get('SELECT * FROM leads WHERE id = @id', { id });
  return res.json(lead);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  run('DELETE FROM leads WHERE id = @id', { id });
  return res.json({ message: 'Лід видалено.' });
});

router.post('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const lead = get('SELECT * FROM leads WHERE id = @id', { id });
  if (!lead) {
    return res.status(404).json({ message: 'Лід не знайдений.' });
  }

  let nextStatus = status;
  if (!nextStatus) {
    const currentIndex = statusOrder.indexOf(lead.status);
    nextStatus = statusOrder[Math.min(currentIndex + 1, statusOrder.length - 1)];
  }

  run('UPDATE leads SET status = @status WHERE id = @id', { id, status: nextStatus });

  const updated = get('SELECT * FROM leads WHERE id = @id', { id });
  return res.json(updated);
});

module.exports = router;
