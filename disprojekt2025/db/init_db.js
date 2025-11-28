const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.join(__dirname, 'mindb.sqlite'));

async function initializeDatabase() {
  try {
    console.log('Creating db if it doesnt exist');
    
    // 1. Opret tabel
    await new Promise((resolve, reject) => {
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )`, (err) => {
        if (err) reject(err);
        else {
          console.log('Table created or already exists');
          resolve();
        }
      });
    });

    const users = [
      { username: 'alex123', email: 'alzifa633@gmail.com', password: '12345' }
    ];

    // 2. Indsæt brugere
    for (const user of users) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT OR IGNORE INTO users (username, email, password) VALUES (?, ?, ?)',
          [user.username, user.email, user.password],
          function(err) {
            if (err) {
              reject(err);
            } else {
              if (this.changes > 0) {
                console.log(`✅ Successfully inserted user: ${user.username}`);
              } else {
                console.log(`ℹ️ User ${user.username} already exists`);
              }
              resolve();
            }
          }
        );
      });
    }

    console.log('✅ All users processed successfully');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    // 3. Luk database
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

// Kør initialisering
initializeDatabase();