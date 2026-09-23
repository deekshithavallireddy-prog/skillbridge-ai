const express = require('express');
const { query, run } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/log', auth, (req, res) => {
  try {
    const { subject, topic, questions_attempted, correct, wrong, score, duration_seconds } = req.body;
    if (!subject || !topic) return res.status(400).json({ error: 'Subject and topic required' });
    run('INSERT INTO practice_logs (user_id, subject, topic, questions_attempted, correct, wrong, score, duration_seconds) VALUES (?,?,?,?,?,?,?,?)',
      [req.user.id, subject, topic, questions_attempted||0, correct||0, wrong||0, score||0, duration_seconds||0]);
    res.status(201).json({ success: true, message: 'Practice session saved' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/history', auth, (req, res) => {
  try {
    const logs = query('SELECT * FROM practice_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [req.user.id]);
    res.json(logs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/stats', auth, (req, res) => {
  try {
    const rows = query('SELECT COUNT(*) as total_sessions, SUM(questions_attempted) as total_questions, AVG(score) as avg_score, MAX(score) as best_score, SUM(duration_seconds) as total_time FROM practice_logs WHERE user_id = ?', [req.user.id]);
    const subjects = query('SELECT DISTINCT subject FROM practice_logs WHERE user_id = ?', [req.user.id]);
    const s = rows[0] || {};
    res.json({
      total_sessions: s.total_sessions || 0,
      total_questions: s.total_questions || 0,
      avg_score: Math.round(s.avg_score || 0),
      best_score: s.best_score || 0,
      total_time: s.total_time || 0,
      subjects_practiced: subjects.map(r => r.subject)
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
