const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '..')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/users'));
app.use('/api/practice', require('./routes/practice'));
app.use('/api/gate', require('./routes/gate'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'SkillBridge AI Server Running' }));

// All other routes → serve index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  }
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
