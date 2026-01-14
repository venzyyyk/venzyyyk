const express = require('express');
const { all, get, run } = require('../utils/db');

const router = express.Router();

router.get('/', (req, res) => {
  const { package: packageName, dealStatus } = req.query;
  const filters = [];
  const params = {};

  if (packageName) {
    filters.push('deals.package = @packageName');
    params.packageName = packageName;
  }

  if (dealStatus) {
    filters.push('deals.dealStatus = @dealStatus');
    params.dealStatus = dealStatus;
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const items = all(
    `SELECT deals.*, leads.name as leadName
     FROM deals
     JOIN leads ON leads.id = deals.leadId
     ${where}
     ORDER BY datetime(deals.createdAt) DESC`,
    params
  );

  return res.json(items);
});

router.post('/', (req, res) => {
  const { leadId, package: packageName, price, startDate, endDate, dealStatus } = req.body;

  if (!leadId || !packageName || !price || !startDate || !endDate || !dealStatus) {
    return res.status(400).json({ message: 'Заповніть усі обовʼязкові поля.' });
  }

  const lead = get('SELECT * FROM leads WHERE id = @id', { id: leadId });
  if (!lead) {
    return res.status(404).json({ message: 'Лід не знайдений.' });
  }

  const result = run(
    `INSERT INTO deals (leadId, package, price, startDate, endDate, dealStatus)
     VALUES (@leadId, @packageName, @price, @startDate, @endDate, @dealStatus)`,
    { leadId, packageName, price, startDate, endDate, dealStatus }
  );

  const deal = get('SELECT * FROM deals WHERE id = @id', { id: result.lastInsertRowid });
  return res.status(201).json(deal);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { leadId, package: packageName, price, startDate, endDate, dealStatus } = req.body;

  if (!leadId || !packageName || !price || !startDate || !endDate || !dealStatus) {
    return res.status(400).json({ message: 'Заповніть усі обовʼязкові поля.' });
  }

  run(
    `UPDATE deals
     SET leadId = @leadId,
         package = @packageName,
         price = @price,
         startDate = @startDate,
         endDate = @endDate,
         dealStatus = @dealStatus
     WHERE id = @id`,
    { id, leadId, packageName, price, startDate, endDate, dealStatus }
  );

  const deal = get('SELECT * FROM deals WHERE id = @id', { id });
  return res.json(deal);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  run('DELETE FROM deals WHERE id = @id', { id });
  return res.json({ message: 'Угоду видалено.' });
});

module.exports = router;
