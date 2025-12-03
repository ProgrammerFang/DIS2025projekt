// db/database.js
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, 'mindb.sqlite');
    this.db = null;
  }

  connect() {
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
      }
    });
    return this.db;
  }

  getDB() {
    if (!this.db) {
      return this.connect();
    }
    return this.db;
  }
}

module.exports = new Database();