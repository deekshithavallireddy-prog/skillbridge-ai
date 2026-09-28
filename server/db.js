const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'skillbridge.db');

let db;

async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    course TEXT DEFAULT '',
    year TEXT DEFAULT '',
    goal TEXT DEFAULT '',
    skills TEXT DEFAULT '[]',
    skill_level TEXT DEFAULT 'beginner',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS practice_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    questions_attempted INTEGER DEFAULT 0,
    correct INTEGER DEFAULT 0,
    wrong INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS gate_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    status TEXT DEFAULT 'not_started',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, subject, topic)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS generated_papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    num_questions INTEGER DEFAULT 10,
    questions_json TEXT DEFAULT '[]',
    result_json TEXT DEFAULT 'null',
    score INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Quiz Attempts Table for tracking non-repeating questions
  db.run(`CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    answered_question_ids TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Interview Preparation Progress Table
  db.run(`CREATE TABLE IF NOT EXISTS interview_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    topic TEXT NOT NULL,
    questions_attempted INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    result_json TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Resume Analyses Table
  db.run(`CREATE TABLE IF NOT EXISTS resume_analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    resume_name TEXT DEFAULT '',
    score INTEGER DEFAULT 0,
    skills_found TEXT DEFAULT '[]',
    missing_skills TEXT DEFAULT '[]',
    analysis_json TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Seed default admin
  const adminEmail = 'admin@skillbridge.ai';
  const admins = db.exec(`SELECT id FROM admins WHERE email = '${adminEmail}'`);
  if (!admins.length || !admins[0].values.length) {
    const hash = bcrypt.hashSync('Admin@123', 10);
    db.run(`INSERT INTO admins (name, email, password_hash) VALUES ('Admin', '${adminEmail}', '${hash}')`);
    console.log('✅ Default admin created: admin@skillbridge.ai / Admin@123');
  }

  saveDB();
  console.log('✅ Database initialized with extended tables');
  return db;
}

function saveDB() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function query(sql, params = []) {
  if (!db) throw new Error('Database not initialized');
  let preparedSql = sql;
  params.forEach(p => {
    const val = (p === null || p === undefined) ? 'NULL' : (typeof p === 'string' ? `'${p.replace(/'/g, "''")}'` : p);
    preparedSql = preparedSql.replace('?', val);
  });
  const res = db.exec(preparedSql);
  if (!res.length) return [];
  const cols = res[0].columns;
  return res[0].values.map(row => {
    const obj = {};
    cols.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

function queryOne(sql, params = []) {
  const rows = query(sql, params);
  return rows.length ? rows[0] : null;
}

function run(sql, params = []) {
  if (!db) throw new Error('Database not initialized');
  let preparedSql = sql;
  params.forEach(p => {
    const val = (p === null || p === undefined) ? 'NULL' : (typeof p === 'string' ? `'${p.replace(/'/g, "''")}'` : p);
    preparedSql = preparedSql.replace('?', val);
  });
  db.run(preparedSql);
  saveDB();
  const res = db.exec('SELECT last_insert_rowid() as id');
  const lastID = (res.length && res[0].values.length) ? res[0].values[0][0] : null;
  return { lastID };
}

module.exports = { initDB, query, queryOne, run, saveDB };
