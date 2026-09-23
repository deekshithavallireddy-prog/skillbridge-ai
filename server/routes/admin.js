const express = require('express');
const { query } = require('../db');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

router.get('/stats', adminAuth, (req, res) => {
  try {
    const users = query('SELECT COUNT(*) as c FROM users');
    const sessions = query('SELECT COUNT(*) as c FROM practice_logs');
    const questions = query('SELECT SUM(questions_attempted) as c FROM practice_logs');
    const gate_updates = query('SELECT COUNT(*) as c FROM gate_progress WHERE status="completed"');
    const recent = query('SELECT COUNT(*) as c FROM users WHERE created_at >= datetime("now","-7 days")');
    const avg_score = query('SELECT AVG(score) as c FROM practice_logs');
    res.json({
      total_users: users[0].c || 0,
      total_practice_sessions: sessions[0].c || 0,
      total_questions_attempted: questions[0].c || 0,
      gate_topics_completed: gate_updates[0].c || 0,
      recent_signups_7days: recent[0].c || 0,
      avg_score: Math.round(avg_score[0].c || 0)
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/users', adminAuth, (req, res) => {
  try {
    const users = query('SELECT u.id, u.name, u.email, u.course, u.year, u.goal, u.created_at, COUNT(p.id) as sessions, ROUND(AVG(p.score),0) as avg_score, MAX(p.created_at) as last_active FROM users u LEFT JOIN practice_logs p ON u.id=p.user_id GROUP BY u.id ORDER BY u.created_at DESC');
    res.json(users);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/user/:id', adminAuth, (req, res) => {
  try {
    const users = query('SELECT id, name, email, course, year, goal, skill_level, created_at FROM users WHERE id=?', [req.params.id]);
    if (!users.length) return res.status(404).json({ error: 'User not found' });
    const logs = query('SELECT * FROM practice_logs WHERE user_id=? ORDER BY created_at DESC', [req.params.id]);
    const gate = query('SELECT * FROM gate_progress WHERE user_id=? AND status="completed" ORDER BY updated_at DESC', [req.params.id]);
    const papers = query('SELECT id, subject, topic, difficulty, score, total, created_at FROM generated_papers WHERE user_id=? ORDER BY created_at DESC LIMIT 10', [req.params.id]);
    res.json({ user: users[0], practice_logs: logs, gate_progress: gate, generated_papers: papers });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/practice-analytics', adminAuth, (req, res) => {
  try {
    const bySubject = query('SELECT subject, COUNT(*) as sessions, SUM(questions_attempted) as total_questions, ROUND(AVG(score),0) as avg_score, MAX(score) as best_score FROM practice_logs GROUP BY subject ORDER BY sessions DESC');
    res.json(bySubject);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/recent-activity', adminAuth, (req, res) => {
  try {
    const rows = query('SELECT p.*, u.name as user_name, u.email as user_email FROM practice_logs p JOIN users u ON p.user_id=u.id ORDER BY p.created_at DESC LIMIT 30');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
