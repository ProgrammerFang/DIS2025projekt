const express = require('express');
const router = express.Router();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'db', 'mindb.sqlite');
const db = new sqlite3.Database(dbPath);

/* GET alle brugere */
router.get('/', (req, res, next) => {
  db.all("SELECT id, username, email, created_at FROM users", [], (err, rows) => {
    if (err) {
      return next(err);
    }
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Ingen brugere fundet' });
    }
    res.json(rows);
  });
});

/* GET bruger ud fra brugernavn */
router.get('/:username', (req, res, next) => {
  const username = req.params.username;
  
  db.get(
    "SELECT id, username, email, created_at FROM users WHERE username = ?",
    [username],
    (err, row) => {
      if (err) {
        return next(err);
      }
      if (!row) {
        return res.status(404).json({ message: 'Bruger ikke fundet!' });
      }
      res.json(row);
    }
  );
});

/* GET bruger ud fra ID */
router.get('/id/:id', (req, res, next) => {
  const id = req.params.id;
  
  db.get(
    "SELECT id, username, email, created_at FROM users WHERE id = ?",
    [id],
    (err, row) => {
      if (err) {
        return next(err);
      }
      if (!row) {
        return res.status(404).json({ message: 'Bruger ikke fundet!' });
      }
      res.json(row);
    }
  );
});

/* PUT opdater bruger ud fra brugernavn */
router.put('/update/:username', (req, res, next) => {
  const username = req.params.username;
  const { email, password } = req.body;

  db.run(
    "UPDATE users SET email = ?, password = ? WHERE username = ?",
    [email, password, username],
    function(err) {
      if (err) {
        return next(err);
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Bruger ikke fundet!' });
      }
      
      res.json({ 
        message: 'Bruger opdateret!',
        changes: this.changes 
      });
    }
  );
});

/* DELETE slet bruger ud fra brugernavn */
router.delete('/delete/:username', (req, res, next) => {
  const username = req.params.username;

  db.run(
    "DELETE FROM users WHERE username = ?",
    [username],
    function(err) {
      if (err) {
        return next(err);
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Bruger ikke fundet!' });
      }
      
      res.json({ 
        message: 'Bruger slettet!',
        changes: this.changes 
      });
    }
  );
});

module.exports = router;