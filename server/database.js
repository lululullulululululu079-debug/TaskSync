const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "tasksync.db"));

// Увімкнення зв'язків між таблицями
db.pragma("foreign_keys = ON");

// Таблиця користувачів
db.exec(`
  CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Таблиця проєктів
db.exec(`
  CREATE TABLE IF NOT EXISTS Projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
  );
`);

// Таблиця завдань
db.exec(`
  CREATE TABLE IF NOT EXISTS Tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'To Do'
      CHECK (status IN ('To Do', 'In Progress', 'Done')),
    priority TEXT DEFAULT 'Medium'
      CHECK (priority IN ('High', 'Medium', 'Low')),
    due_date TEXT,
    project_id INTEGER NOT NULL,
    assignee_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES Projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES Users(id) ON DELETE SET NULL
  );
`);

console.log("TaskSync database initialized successfully!");

module.exports = db;