#!/usr/bin/env node
// One-time script: delete all todos from the database

const path = require('path');
const Database = require('better-sqlite3');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'crm.db');
const db = new Database(dbPath);

const count = db.prepare('SELECT COUNT(*) as n FROM todos').get().n;
if (count === 0) {
  console.log('No todos to delete.');
} else {
  db.prepare('DELETE FROM todos').run();
  console.log(`Deleted ${count} todos.`);
}

db.close();
