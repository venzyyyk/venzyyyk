const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', 'db', 'database.sqlite');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

const run = (sql, params = {}) => db.prepare(sql).run(params);
const get = (sql, params = {}) => db.prepare(sql).get(params);
const all = (sql, params = {}) => db.prepare(sql).all(params);

module.exports = {
  db,
  run,
  get,
  all
};
