import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// CONNECT DATABASE
const db = new sqlite3.Database("appointments.db", () => {
  console.log("✅ SQLite database connected");
});

// CREATE TABLE WITH UNIQUE DATE+TIME
db.run(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    service TEXT,
    date TEXT,
    time TEXT,
    UNIQUE(date, time)
  )
`);

// GET BOOKED TIMES
app.get("/api/booked-times", (req, res) => {
  const { date } = req.query;

  db.all(
    "SELECT time FROM appointments WHERE date = ?",
    [date],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows.map(r => r.time));
    }
  );
});

// BOOK APPOINTMENT
app.post("/api/book", (req, res) => {
  const { name, service, date, time } = req.body;

  db.run(
    "INSERT INTO appointments (name, service, date, time) VALUES (?, ?, ?, ?)",
    [name, service, date, time],
    function (err) {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "Time slot already booked."
        });
      }
      res.json({ success: true });
    }
  );
});

// START SERVER
app.listen(3000, () =>
  console.log("🚀 Server running at http://localhost:3000")
);
