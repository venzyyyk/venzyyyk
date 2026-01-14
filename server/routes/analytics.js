const express = require('express');
const { all, get } = require('../utils/db');

const router = express.Router();

router.get('/kpi', (req, res) => {
  const total = get('SELECT COUNT(*) as total FROM leads');
  const won = get("SELECT COUNT(*) as won FROM leads WHERE status = 'Won'");
  const lost = get("SELECT COUNT(*) as lost FROM leads WHERE status = 'Lost'");
  const revenue = get(
    "SELECT COALESCE(SUM(price), 0) as revenue FROM deals WHERE dealStatus IN ('Active', 'Finished')"
  );

  const conversion = total.total > 0 ? Number(((won.won / total.total) * 100).toFixed(1)) : 0;

  return res.json({
    totalLeads: total.total,
    wonLeads: won.won,
    lostLeads: lost.lost,
    conversion,
    revenue: revenue.revenue
  });
});

router.get('/funnel', (req, res) => {
  const items = all(
    `SELECT status as label, COUNT(*) as value
     FROM leads
     GROUP BY status
     ORDER BY value DESC`
  );

  return res.json(items);
});

router.get('/revenue', (req, res) => {
  const items = all(
    `SELECT strftime('%Y-%m', startDate) as period, COALESCE(SUM(price), 0) as value
     FROM deals
     GROUP BY period
     ORDER BY period ASC`
  );

  return res.json(items);
});

router.get('/sources', (req, res) => {
  const items = all(
    `SELECT source as label,
            COUNT(*) as leads,
            COALESCE(SUM(estimatedBudget), 0) as budget
     FROM leads
     GROUP BY source
     ORDER BY leads DESC`
  );

  return res.json(items);
});

router.get('/owners', (req, res) => {
  const { dateFrom, dateTo } = req.query;
  const filters = [];
  const params = {};

  if (dateFrom) {
    filters.push('date(leads.createdAt) >= date(@dateFrom)');
    params.dateFrom = dateFrom;
  }

  if (dateTo) {
    filters.push('date(leads.createdAt) <= date(@dateTo)');
    params.dateTo = dateTo;
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const items = all(
    `SELECT users.name as label, COUNT(leads.id) as value
     FROM users
     LEFT JOIN leads ON leads.ownerId = users.id
     ${where}
     GROUP BY users.id
     ORDER BY value DESC`,
    params
  );

  return res.json(items);
});

module.exports = router;
