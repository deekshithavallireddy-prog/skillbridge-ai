const express = require('express');
const { query, run } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/profile', auth, (req, res) => {
  try {
    const users = query('SELECT id, name, email, course, year, goal, skills, skill_level, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!users.length) return res.status(404).json({ error: 'User not found' });
    const u = users[0];
    u.skills = JSON.parse(u.skills || '[]');
    res.json(u);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/profile', auth, (req, res) => {
  try {
    const { name, course, year, goal, skills, skill_level } = req.body;
    const skillsJson = JSON.stringify(Array.isArray(skills) ? skills : []);
    run('UPDATE users SET name=?, course=?, year=?, goal=?, skills=?, skill_level=? WHERE id=?',
      [name || req.user.name, course || '', year || '', goal || '', skillsJson, skill_level || 'beginner', req.user.id]);
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/progress', auth, (req, res) => {
  try {
    const logs = query('SELECT * FROM practice_logs WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    const gate = query('SELECT * FROM gate_progress WHERE user_id = ? ORDER BY updated_at DESC', [req.user.id]);
    res.json({ practice_logs: logs, gate_progress: gate });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
