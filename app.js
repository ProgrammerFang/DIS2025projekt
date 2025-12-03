var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var rateLimit = require('express-rate-limit');
var { RedisStore } = require('connect-redis');
var { createClient } = require('redis');

require('dotenv').config();

var usersRouter = require('./disprojekt2025/routes/users');
var authRouter = require('./disprojekt2025/routes/auth');
var chatRouter = require('./disprojekt2025/routes/deepseek');

var session = require('express-session');

var app = express();

// Trust proxy for HTTPS (kun hvis du kører bag reverse proxy)
app.set('trust proxy', 1);

// Redis session setup
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) => console.error('Redis error:', err));
redisClient.connect().catch((err) => console.error('Redis connect failed:', err));

// Rate limiting på chat API
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutter
  max: 100,
  message: { error: 'For mange forespørgsler. Vent venligst 15 minutter.' },
  standardHeaders: true,
  legacyHeaders: false
});

// View engine setup
app.set('views', path.join(__dirname, 'disprojekt2025/views'));
app.set('view engine', 'html');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname,'disprojekt2025', 'public')));

// Session middleware
app.use(session({
  store: new RedisStore({ client: redisClient, prefix: 'sess:' }),
  name: 'sid',
  secret: process.env.SESSION_SECRET || 'din-hemmelige-nøgle-her',
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // false til lokal udvikling over HTTP. Sæt til true i produktion HTTPS
    maxAge: 30 * 60 * 1000 // 30 minutter
  }
}));

// No-cache headers for protected pages
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Rate limit på chat API
app.use('/api/chat', chatLimiter);

// 🔴 Protected routes
app.get('/forside.html', (req, res) => {
  if (!req.session.user) return res.redirect('/login.html');
  res.sendFile(path.join(__dirname, 'disprojekt2025', 'protected', 'forside.html'));
});

app.get('/forside', (req, res) => {
  if (!req.session.user) return res.redirect('/login.html');
  res.sendFile(path.join(__dirname, 'disprojekt2025', 'protected', 'forside.html'));
});

// 🔴 Root route
app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/forside');
  res.sendFile(path.join(__dirname, 'disprojekt2025', 'public', 'index.html'));
});

// Routers
app.use('/auth', authRouter);
app.use('/api', chatRouter);
app.use('/users', usersRouter);

// Session health check
app.get('/session-health', (req, res) => {
  req.session.views = (req.session.views || 0) + 1;
  res.json({
    ok: true,
    sid: req.sessionID,
    user: req.session.user || null,
    views: req.session.views,
    cookies: req.headers['cookie'] || null
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  console.error(err);
  res.status(err.status || 500);
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Fejl ${err.status || 500}</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            h1 { color: #d32f2f; }
            a { color: #1976d2; text-decoration: none; }
            a:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <h1>${err.message}</h1>
        <h2>Status kode: ${err.status || 500}</h2>
        ${req.app.get('env') === 'development' ? `<pre>${err.stack}</pre>` : ''}
        <br><br>
        <a href="/">&#8592; Tilbage til forsiden</a>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server kører på http://0.0.0.0:${PORT}`);
});

module.exports = app;
