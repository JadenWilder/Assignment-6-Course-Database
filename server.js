const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());

// Connect to database
const dbPath = path.join(__dirname, "database", "university.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
    return;
  }
  console.log("Connected to university.db");
});

// Root route (optional but nice to have)
app.get("/", (req, res) => {
  res.send("Course Database API is running.");
});

/**
 * GET /api/courses
 * Return all courses
 */
app.get("/api/courses", (req, res) => {
  const sql = `SELECT * FROM courses`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(rows);
  });
});

/**
 * GET /api/courses/:id
 * Return one course by id
 */
app.get("/api/courses/:id", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM courses WHERE id = ?`;

  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json(row);
  });
});

/**
 * POST /api/courses
 * Add a new course
 */
app.post("/api/courses", (req, res) => {
  const { courseCode, title, credits, description, semester } = req.body;

  if (!courseCode || !title || !credits || !semester) {
    return res.status(400).json({
      error: "courseCode, title, credits, and semester are required"
    });
  }

  const sql = `
    INSERT INTO courses (courseCode, title, credits, description, semester)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [courseCode, title, credits, description || "", semester], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.get(`SELECT * FROM courses WHERE id = ?`, [this.lastID], (err, newCourse) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json(newCourse);
    });
  });
});

/**
 * PUT /api/courses/:id
 * Update existing course
 */
app.put("/api/courses/:id", (req, res) => {
  const { id } = req.params;
  const { courseCode, title, credits, description, semester } = req.body;

  if (!courseCode || !title || !credits || !semester) {
    return res.status(400).json({
      error: "courseCode, title, credits, and semester are required"
    });
  }

  const sql = `
    UPDATE courses
    SET courseCode = ?, title = ?, credits = ?, description = ?, semester = ?
    WHERE id = ?
  `;

  db.run(sql, [courseCode, title, credits, description || "", semester, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    db.get(`SELECT * FROM courses WHERE id = ?`, [id], (err, updatedCourse) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json(updatedCourse);
    });
  });
});

/**
 * DELETE /api/courses/:id
 * Delete a course
 */
app.delete("/api/courses/:id", (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM courses WHERE id = ?`;

  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(200).json({ message: "Course deleted successfully" });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});