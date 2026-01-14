PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager')),
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  estimatedBudget REAL NOT NULL,
  createdAt TEXT DEFAULT (datetime('now')),
  ownerId INTEGER NOT NULL,
  FOREIGN KEY (ownerId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS deals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  leadId INTEGER NOT NULL,
  package TEXT NOT NULL,
  price REAL NOT NULL,
  startDate TEXT NOT NULL,
  endDate TEXT NOT NULL,
  dealStatus TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (leadId) REFERENCES leads(id)
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dealId INTEGER NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  dueDate TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (dealId) REFERENCES deals(id)
);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entityType TEXT NOT NULL CHECK (entityType IN ('lead', 'deal')),
  entityId INTEGER NOT NULL,
  text TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now')),
  authorId INTEGER NOT NULL,
  FOREIGN KEY (authorId) REFERENCES users(id)
);
