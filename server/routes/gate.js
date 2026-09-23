const express = require('express');
const { query, run } = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

const GATE_SUBJECTS = {
  'Engineering Mathematics': ['Linear Algebra','Calculus','Probability & Statistics','Combinatorics','Graph Theory','Set Theory & Logic'],
  'Digital Logic': ['Boolean Algebra','K-Maps (Karnaugh Maps)','Combinational Circuits','Sequential Circuits','Number Systems & Codes'],
  'Computer Organization & Architecture': ['Machine Instructions & ISA','Pipelining','Cache Memory','Memory Organization','I/O Organization & Interrupts'],
  'Programming & Data Structures': ['C Programming Fundamentals','Arrays & Strings','Linked Lists','Trees & Binary Trees','Graphs','Hashing','Stacks & Queues'],
  'Algorithms': ['Asymptotic Analysis & Complexity','Sorting Algorithms','Searching Algorithms','Graph Algorithms (BFS/DFS/Dijkstra)','Dynamic Programming','Greedy Algorithms','Divide & Conquer'],
  'Theory of Computation': ['Regular Languages & DFA','NFA & Equivalence','Context-Free Grammars','Pushdown Automata','Turing Machines','Decidability & Undecidability'],
  'Compiler Design': ['Lexical Analysis','Top-Down Parsing','Bottom-Up Parsing','Syntax-Directed Translation','Intermediate Code Generation','Code Optimization','Code Generation'],
  'Operating Systems': ['Process Management','CPU Scheduling','Memory Management & Paging','Virtual Memory & Page Replacement','Deadlocks','File Systems','Synchronization'],
  'DBMS': ['Relational Model & Algebra','SQL Queries','Normalization (1NF-BCNF)','Transactions & ACID','Concurrency Control','Indexing & B+ Trees'],
  'Computer Networks': ['OSI & TCP/IP Model','Data Link Layer & Error Control','Network Layer & IP Addressing','Routing Algorithms','Transport Layer (TCP/UDP)','Application Layer Protocols']
};

router.get('/subjects', auth, (req, res) => {
  res.json(GATE_SUBJECTS);
});

router.post('/progress', auth, (req, res) => {
  try {
    const { subject, topic, status } = req.body;
    if (!subject || !topic) return res.status(400).json({ error: 'Subject and topic required' });
    // Check if exists
    const existing = query('SELECT id FROM gate_progress WHERE user_id=? AND subject=? AND topic=?', [req.user.id, subject, topic]);
    if (existing.length) {
      run('UPDATE gate_progress SET status=?, updated_at=CURRENT_TIMESTAMP WHERE user_id=? AND subject=? AND topic=?',
        [status || 'completed', req.user.id, subject, topic]);
    } else {
      run('INSERT INTO gate_progress (user_id, subject, topic, status) VALUES (?,?,?,?)',
        [req.user.id, subject, topic, status || 'completed']);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/progress', auth, (req, res) => {
  try {
    const rows = query('SELECT * FROM gate_progress WHERE user_id = ? ORDER BY updated_at DESC', [req.user.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
