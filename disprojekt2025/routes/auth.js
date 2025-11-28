const express = require('express');
const router = express.Router();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt'); // Installér: npm install bcrypt

const dbPath = path.join(__dirname, '..', 'db', 'mindb.sqlite');
const db = new sqlite3.Database(dbPath);

// Login route
router.post('/login', (req, res, next) => {
  const { username, password } = req.body;

  console.log('Login forsøg:', { username });

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Brugernavn og adgangskode er påkrævet'
    });
  }

  db.get(
    "SELECT id, username, password, email FROM users WHERE username = ?",
    [username],
    async (err, row) => {
      if (err) {
        return next(err);
      }
      if (!row) {
        console.log('Bruger ikke fundet:', username);
        return res.status(401).json({
          success: false,
          message: 'Forkert brugernavn eller adgangskode'
        });
      }

      // Tjek password (med bcrypt - sikrere!)
      try {
        // Hvis passwords er hashet, brug: await bcrypt.compare(password, row.password)
        // For nu, simpel sammenligning (ikke sikkert!)
        if (row.password !== password) {
          console.log('Forkert adgangskode for bruger:', username);
          return res.status(401).json({
            success: false,
            message: 'Forkert brugernavn eller adgangskode'
          });
        }

        // Login succesfuld
        console.log('Login succesfuld for:', username);
        req.session.user = {
          id: row.id,
          username: row.username,
          email: row.email
        };

        res.json({
          success: true,
          message: 'Login succesfuld',
          user: {
            id: row.id,
            username: row.username,
            email: row.email
          }
        });
      } catch (error) {
        next(error);
      }
    }
  );
});

// Opret bruger route
router.post('/create', (req, res, next) => {
  const { username, email, password } = req.body;

  console.log('Opret bruger forsøg:', { username, email });

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Brugernavn, email og adgangskode er påkrævet'
    });
  }

  // Tjek om brugeren allerede eksisterer
  db.get(
    "SELECT id FROM users WHERE username = ? OR email = ?",
    [username, email],
    (err, row) => {
      if (err) {
        return next(err);
      }
      if (row) {
        return res.status(409).json({
          success: false,
          message: 'Brugernavn eller email eksisterer allerede'
        });
      }

      // Indsæt ny bruger
      db.run(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, password], // I produktion: hash password med bcrypt
        function(err) {
          if (err) {
            return next(err);
          }

          console.log('Bruger oprettet:', username);
          res.status(201).json({
            success: true,
            message: 'Bruger oprettet succesfuldt',
            user: {
              id: this.lastID,
              username: username,
              email: email
            }
          });
        }
      );
    }
  );
});

// Logud route
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout fejl:', err);
      return res.status(500).json({ success: false, message: 'Logout fejlede' });
    }
    
    res.clearCookie('connect.sid');
    res.clearCookie('sid');
    
    res.json({ success: true, message: 'Logout succesfuld' });
  });
});

// Hent current user
router.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    return res.json({
      success: true,
      user: req.session.user
    });
  }
  res.status(401).json({
    success: false,
    message: 'Ikke logget ind'
  });
});

module.exports = router;