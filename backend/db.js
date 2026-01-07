const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to database.sqlite inside the backend folder
const db = new sqlite3.Database(
  path.join(__dirname, 'database.sqlite'),
  (err) => {
    if (err) {
      console.error('!! Failed to connect to SQLite DB:', err.message);
    } else {
      console.log('Connected to SQLite database.');
    }
  }
);

module.exports = db;
