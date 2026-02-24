const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Path to database file
const dbPath = path.join(__dirname, "university.db");

// Open/create database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
    return;
  }
  console.log("Connected to SQLite database.");
});

// Create courses table
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    courseCode TEXT NOT NULL,
    title TEXT NOT NULL,
    credits INTEGER NOT NULL,
    description TEXT,
    semester TEXT NOT NULL
  )
`;

db.run(createTableQuery, (err) => {
  if (err) {
    console.error("Error creating courses table:", err.message);
    return;
  }
  console.log("Courses table created successfully.");
});

// Close database connection
db.close((err) => {
  if (err) {
    console.error("Error closing database:", err.message);
    return;
  }
  console.log("Database connection closed.");
});