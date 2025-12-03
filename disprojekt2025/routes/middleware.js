var express = require('express');
var router = express.Router();


// Sikker middleware der tjekker både session og custom cookie
const secureMiddleware = (req, res, next) => {
  if (
    req.session && req.session.user &&
    req.cookies && req.cookies.myCookie === 'cookieValue'
  ) {
    next();
  } else {
    res.status(401).json({ message: 'Ikke logget ind eller mangler cookie!' });
  }
};


// Beskyttet route med secureMiddleware
router.get('/', secureMiddleware, async (req, res) => {
  res.json({ message: 'Du er logget ind!', user: req.session.user });
});


module.exports = router;