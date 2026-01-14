const fs = require('fs');
const path = require('path');
const { db } = require('../utils/db');

const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
const seedPath = path.join(__dirname, '..', 'db', 'seed.sql');

const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
const seedSql = fs.readFileSync(seedPath, 'utf-8');

const hasUsers = db.prepare('SELECT COUNT(*) as count FROM sqlite_master WHERE type = ? AND name = ?').get('table', 'users');

if (!hasUsers || hasUsers.count === 0) {
  db.exec(schemaSql);
  db.exec(seedSql);
  console.log('База даних ініціалізована та наповнена seed-даними.');
} else {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    db.exec(seedSql);
    console.log('Seed-дані додані у наявну базу.');
  } else {
    console.log('База даних вже ініціалізована.');
  }
}
