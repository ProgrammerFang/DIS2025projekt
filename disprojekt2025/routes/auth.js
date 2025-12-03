const express = require('express');
const router = express.Router();
var users = require('../db/brugere');
const { secureLoginMiddleware } = require('./middleware');

// Login route
router.post('/login', (req, res) => {
  const { brugernavn, adgangskode } = req.body;
  // Valider input
  if (!brugernavn || !adgangskode) {
    return res.status(400).json({ success: false, message: 'Brugernavn og adgangskode er påkrævet' });
  }
  // Find brugeren i array
  const user = users.find(u => u.username === brugernavn);
  if (!user || user.password !== adgangskode) {
    return res.status(401).json({ success: false, message: 'Forkert brugernavn eller adgangskode' });
  }
  // Login succesfuld
  req.session.user = { username: user.username, email: user.email };
  // Sæt custom cookie
  res.cookie('myCookie', 'cookieValue', { httpOnly: true, sameSite: 'lax' });
  res.json({ success: true, message: 'Login succesfuld', user: req.session.user });
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout fejl:', err);
      return res.status(500).json({ success: false, message: 'Logout fejlede' });
    }
    // Clear possible session cookies (default and custom name)
    res.clearCookie('connect.sid');
    res.clearCookie('sid');
    res.json({ success: true, message: 'Logout succesfuld' });
  });
});

// Return the currently logged-in user (beskyttet med middleware)
router.get('/me', secureLoginMiddleware, (req, res) => {
  res.json({ success: true, user: req.session.user });
});

// User info for frontend
router.get('/user', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user.username });
  } else {
    res.status(401).json({ error: 'Ikke logget ind' });
  }
});

module.exports = router;
