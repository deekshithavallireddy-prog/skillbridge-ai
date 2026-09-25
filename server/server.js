const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.join(__dirname, '..');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (frontend assets, css, js, images)
app.use(express.static(ROOT_DIR));

// Clean URL Route Rewrites (e.g. /admin -> admin-login.html, /dashboard -> dashboard.html)
const pageRoutes = [
  'index',
  'login',
  'signup',
  'onboard',
  'dashboard',
  'my-progress',
  'profile',
  'roadmap',
  'gate',
  'course-prep',
  'ai-questions',
  'interview',
  'quiz',
  'projects',
  'resume',
  'admin-login',
  'admin-dashboard'
];

pageRoutes.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    const filePath = path.join(ROOT_DIR, `${page}.html`);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.sendFile(path.join(ROOT_DIR, 'index.html'));
    }
  });
});

// Admin shortcut route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'admin-login.html'));
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/users'));
app.use('/api/practice', require('./routes/practice'));
app.use('/api/gate', require('./routes/gate'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'SkillBridge AI Server Running' }));

// All other non-API routes → serve index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    // If the path + .html exists, serve it
    const cleanPath = req.path.replace(/^\//, '').replace(/\/$/, '');
    const possibleFile = path.join(ROOT_DIR, `${cleanPath}.html`);
    if (cleanPath && fs.existsSync(possibleFile)) {
      return res.sendFile(possibleFile);
    }
    return res.sendFile(path.join(ROOT_DIR, 'index.html'));
  }
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server after DB init
initDB().then(() => {
  app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║     SkillBridge AI Server Started!       ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║  🌐 Website: http://localhost:${PORT}       ║`);
    console.log('║  👤 Login:   /login.html                 ║');
    console.log('║  🎓 GATE:    /gate.html                  ║');
    console.log('║  📚 Course:  /course-prep.html           ║');
    console.log('║  🤖 AI Qs:   /ai-questions.html          ║');
    console.log('║  👑 Admin:   /admin-login.html           ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log('║  Admin:  admin@skillbridge.ai            ║');
    console.log('║  Pass:   Admin@123                       ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('');
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
