const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.join(__dirname, 'mindb.sqlite'));

// Opretter tabel hvis den ikke findes
db.serialize(() => {
    console.log('Creating db if it doesnt exist');
    
    // RETTET: 'INTERGER' -> 'INTEGER' og 'AUTOINCREMENT' -> 'AUTOINCREMENT'
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error('Error creating table:', err);
        } else {
            console.log('Table created or already exists');
        }
    });
});

const users = [
    { username: 'alex123', email: 'alzifa633@gmail.com', password: '12345' }
];

// Funktion til at indsætte brugere i databasen
db.serialize(() => {
    const dbStatement = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
    
    users.forEach(user => {
        // RETTET: 'userpassword' -> 'user.password'
        dbStatement.run(user.username, user.email, user.password, (err) => {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    console.log(`User ${user.username} already exists`);
                } else {
                    console.error(`Failed to insert ${user.username}:`, err);
                }
            } else {
                console.log(`Successfully inserted user: ${user.username}`);
            }
        });
    });
    
    dbStatement.finalize(err => {
        if (err) {
            console.error('Error finalizing statement:', err);
        } else {
            console.log('All users processed');
        }
        // Luk databasen efter alt er færdigt
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('Database connection closed');
            }
        });
    });
});