const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, run } = require('../db');

const router = express.Router();
const JWT_SECRET = 'skillbridge-secret-key-2024';

router.post('/signup', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required.' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const existing = query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(400).json({ error: 'Email already registered. Please login.' });

    const hash = bcrypt.hashSync(password, 10);
    const info = run('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, hash]);
    const token = jwt.sign({ id: info.lastID, name, email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: info.lastID, name, email, role: 'user' } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

    const users = query('SELECT * FROM users WHERE email = ?', [email]);
    if (!users.length || !bcrypt.compareSync(password, users[0].password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const u = users[0];
    const token = jwt.sign({ id: u.id, name: u.name, email: u.email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: u.id, name: u.name, email: u.email, role: 'user' } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/admin-login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

    const admins = query('SELECT * FROM admins WHERE email = ?', [email]);
    if (!admins.length || !bcrypt.compareSync(password, admins[0].password_hash)) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }
    const a = admins[0];
    const token = jwt.sign({ id: a.id, name: a.name, email: a.email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, admin: { id: a.id, name: a.name, email: a.email, role: 'admin' } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
