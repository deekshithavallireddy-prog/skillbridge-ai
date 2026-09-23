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

  // Seed default admin
  const adminEmail = 'admin@skillbridge.ai';
  const admins = db.exec(`SELECT id FROM admins WHERE email = '${adminEmail}'`);
  if (!admins.length || !admins[0].values.length) {
    const hash = bcrypt.hashSync('Admin@123', 10);
    db.run(`INSERT INTO admins (name, email, password_hash) VALUES ('Admin', '${adminEmail}', '${hash}')`);
    console.log('✅ Default admin created: admin@skillbridge.ai / Admin@123');
  }

  saveDB();
  console.log('✅ Database initialized');
  return db;
}

function saveDB() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function getDB() {
  return db;
}

// Helper: run query and return rows as objects
function query(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    const rows = [];
    stmt.bind(params);
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  } catch (e) {
    console.error('Query error:', e.message, sql);
    throw e;
  }
}

// Helper: run INSERT/UPDATE/DELETE
function run(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.run(params);
    stmt.free();
    // Get last inserted id
    const idRows = query('SELECT last_insert_rowid() as id');
    saveDB();
    return { lastID: idRows[0] ? idRows[0].id : null };
  } catch (e) {
    console.error('Run error:', e.message, sql);
    throw e;
  }
}

module.exports = { initDB, getDB, saveDB, query, run };
