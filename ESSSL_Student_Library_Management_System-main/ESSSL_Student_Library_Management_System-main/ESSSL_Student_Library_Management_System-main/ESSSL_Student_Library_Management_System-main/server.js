require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ===== DB CONNECTION =====
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD || "your_password_here",
  database: "slms_database",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ===== MULTER CONFIG =====
const fs = require("fs");
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, "book_" + Date.now() + path.extname(file.originalname).toLowerCase()),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext  = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error("Only image files (jpg, png, gif, webp) are allowed"));
  },
});

// ===== AUTH =====

// REGISTER
app.post("/register", async (req, res) => {
  const { email, password, first_name, last_name, role, department, is_active } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (email,password,first_name,last_name,role,department,is_active) VALUES (?,?,?,?,?,?,?)",
      [email, hashed, first_name, last_name, role, department, is_active ?? 1]
    );
    res.json({ success: true, message: "Registration successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email=? AND role=?", [email, role]);
    if (!rows.length) return res.status(401).json({ success: false, message: "User not found" });

    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.status(401).json({ success: false, message: "Incorrect password" });

    const { password: _pw, ...userSafe } = rows[0];
    res.json({ success: true, message: "Login successful", user: userSafe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ===== BOOKS =====

app.get("/books", async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = "SELECT * FROM books";
    const params = [];

    if (search) {
      sql += " WHERE (title LIKE ? OR author LIKE ? OR isbn LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      if (category) {
        sql += " AND category=?";
        params.push(category);
      }
    } else if (category) {
      sql += " WHERE category=?";
      params.push(category);
    }

    sql += " ORDER BY id DESC";
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.post("/books", upload.single("cover"), async (req, res) => {
  try {
    const { title, author, isbn, category, publication_year, total_copies } = req.body;
    const cover = req.file ? req.file.filename : null;
    await db.query(
      `INSERT INTO books (title,author,isbn,category,publication_year,total_copies,available_copies,cover_image)
       VALUES (?,?,?,?,?,?,?,?)`,
      [title, author, isbn, category, publication_year, total_copies, total_copies, cover]
    );
    res.json({ success: true, message: "Book added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.put("/books/:id", upload.single("cover"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, isbn, category, publication_year, total_copies } = req.body;
    const cover = req.file ? req.file.filename : null;

    let sql = `UPDATE books SET title=?, author=?, isbn=?, category=?, publication_year=?, total_copies=?, available_copies=?`;
    const params = [title, author, isbn, category, publication_year, total_copies, total_copies];

    if (cover) { sql += `, cover_image=?`; params.push(cover); }
    sql += ` WHERE id=?`;
    params.push(id);

    await db.query(sql, params);
    res.json({ success: true, message: "Book updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.delete("/books/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM books WHERE id=?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// ===== USERS / STUDENTS =====

app.get("/users", async (req, res) => {
  try {
    const role = req.query.role;
    const [rows] = await db.query(
      role ? "SELECT id,email,first_name,last_name,role,department,is_active,created_at FROM users WHERE role=?"
            : "SELECT id,email,first_name,last_name,role,department,is_active,created_at FROM users",
      role ? [role] : []
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id,email,first_name,last_name,role,department,is_active FROM users WHERE id=?",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, department, is_active } = req.body;
    const [rows] = await db.query("SELECT * FROM users WHERE id=?", [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "User not found" });

    await db.query(
      "UPDATE users SET first_name=?, last_name=?, email=?, department=?, is_active=? WHERE id=?",
      [first_name, last_name, email, department, is_active, id]
    );
    res.json({ success: true, message: "Student updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update student" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM users WHERE id=?", [req.params.id]);
    res.json({ success: true, message: "Student deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete student" });
  }
});

app.patch("/users/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT is_active FROM users WHERE id=?", [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "User not found" });

    const newStatus = rows[0].is_active === 1 ? 0 : 1;
    await db.query("UPDATE users SET is_active=? WHERE id=?", [newStatus, id]);
    res.json({ success: true, status: newStatus === 1 ? "Active" : "Blocked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
});

// ===== BORROWING =====

// GET ALL BORROWINGS (with optional user_id filter + book title join)
app.get("/borrowing", async (req, res) => {
  try {
    const { user_id, status } = req.query;
    let sql = `
      SELECT bw.id, bw.user_id, bw.book_id, bw.borrow_date, bw.due_date, bw.return_date, bw.status,
             CONCAT(u.first_name,' ',u.last_name) AS student_name,
             b.title AS book_title, b.author, b.cover_image
      FROM borrowing bw
      JOIN users u ON bw.user_id = u.id
      JOIN books b ON bw.book_id = b.id
    `;
    const params = [];
    const conditions = [];

    if (user_id) { conditions.push("bw.user_id=?"); params.push(user_id); }
    if (status)  { conditions.push("bw.status=?");   params.push(status); }
    if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
    sql += " ORDER BY bw.borrow_date DESC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch borrowings" });
  }
});

// ADD BORROW
app.post("/borrowing", async (req, res) => {
  try {
    const { user_id, book_id, due_date } = req.body;
    if (!user_id || !book_id || !due_date)
      return res.status(400).json({ success: false, message: "All fields are required" });

    // Check book availability
    const [bookRows] = await db.query("SELECT available_copies FROM books WHERE id=?", [book_id]);
    if (!bookRows.length || bookRows[0].available_copies < 1)
      return res.status(400).json({ success: false, message: "Book not available" });

    await db.query(
      "INSERT INTO borrowing (user_id, book_id, due_date, status) VALUES (?,?,?,?)",
      [user_id, book_id, due_date, "Borrowed"]
    );

    // Decrement available copies
    await db.query("UPDATE books SET available_copies = available_copies - 1 WHERE id=?", [book_id]);

    res.json({ success: true, message: "Book borrowed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to borrow book" });
  }
});

// MARK RETURNED
app.patch("/borrowing/:id/return", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM borrowing WHERE id=?", [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Borrow record not found" });
    if (rows[0].status === "Returned")
      return res.status(400).json({ success: false, message: "Already returned" });

    await db.query("UPDATE borrowing SET status='Returned', return_date=NOW() WHERE id=?", [id]);
    // Increment available copies
    await db.query("UPDATE books SET available_copies = available_copies + 1 WHERE id=?", [rows[0].book_id]);

    res.json({ success: true, message: "Book returned successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to mark as returned" });
  }
});

// RENEW BORROW (extend due date by 14 days, max 2 renewals)
app.patch("/borrowing/:id/renew", async (req, res) => {
  try {
    const { id } = req.params;
    const { new_due_date } = req.body;

    const [rows] = await db.query("SELECT * FROM borrowing WHERE id=?", [id]);
    if (!rows.length)
      return res.status(404).json({ success: false, message: "Borrow record not found" });
    if (rows[0].status === "Returned")
      return res.status(400).json({ success: false, message: "Cannot renew a returned book" });

    const renewals = rows[0].renewal_count || 0;
    if (renewals >= 2)
      return res.status(400).json({ success: false, message: "Maximum renewals (2) reached for this book" });

    const finalDueDate = new_due_date || (() => {
      const d = new Date(rows[0].due_date);
      d.setDate(d.getDate() + 14);
      return d.toISOString().split("T")[0];
    })();

    await db.query(
      "UPDATE borrowing SET due_date=?, renewal_count = renewal_count + 1, status='Borrowed' WHERE id=?",
      [finalDueDate, id]
    );
    res.json({ success: true, message: "Book renewed successfully", new_due_date: finalDueDate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to renew book" });
  }
});

// DELETE BORROW RECORD
app.delete("/borrowing/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM borrowing WHERE id=?", [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Borrow record not found" });

    await db.query("DELETE FROM borrowing WHERE id=?", [id]);
    res.json({ success: true, message: "Borrow record deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete borrow record" });
  }
});

// ===== TASKS (static for now) =====
app.get("/tasks", (req, res) => {
  res.json([
    { id: 1, title: "Process pending book returns", priority: "High", dueDate: "2026-02-17" },
    { id: 2, title: "Approve student reservations", priority: "Medium", dueDate: "2026-02-18" },
    { id: 3, title: "Update inventory for new arrivals", priority: "Medium", dueDate: "2026-02-19" },
    { id: 4, title: "Generate monthly reports", priority: "Low", dueDate: "2026-02-28" },
  ]);
});

// ===== RESERVATIONS =====

app.get("/reservations", async (req, res) => {
  try {
    const { user_id } = req.query;
    let sql = `
      SELECT r.id, r.user_id, r.book_id, r.reservation_date, r.status, r.pickup_deadline,
             CONCAT(u.first_name,' ',u.last_name) AS student_name,
             b.title AS book_title
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN books b ON r.book_id = b.id
    `;
    const params = [];
    if (user_id) { sql += " WHERE r.user_id=?"; params.push(user_id); }
    sql += " ORDER BY r.reservation_date DESC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch reservations" });
  }
});

app.post("/reservations", async (req, res) => {
  try {
    const { user_id, book_id, pickup_deadline } = req.body;
    if (!user_id || !book_id || !pickup_deadline)
      return res.status(400).json({ success: false, message: "All fields are required" });

    const [existing] = await db.query(
      "SELECT * FROM reservations WHERE user_id=? AND book_id=? AND status='waiting'",
      [user_id, book_id]
    );
    if (existing.length)
      return res.status(400).json({ success: false, message: "Already has a pending reservation for this book" });

    await db.query(
      "INSERT INTO reservations (user_id, book_id, pickup_deadline, status) VALUES (?,?,?,?)",
      [user_id, book_id, pickup_deadline, "waiting"]
    );
    res.json({ success: true, message: "Reservation added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to add reservation" });
  }
});

app.patch("/reservations/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["waiting", "ready", "cancelled", "completed"].includes(status))
      return res.status(400).json({ success: false, message: "Invalid status" });

    const [rows] = await db.query("SELECT * FROM reservations WHERE id=?", [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Reservation not found" });

    await db.query("UPDATE reservations SET status=? WHERE id=?", [status, id]);
    res.json({ success: true, message: "Status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
});

app.delete("/reservations/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM reservations WHERE id=?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Reservation not found" });

    await db.query("DELETE FROM reservations WHERE id=?", [req.params.id]);
    res.json({ success: true, message: "Reservation deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete reservation" });
  }
});

// ===== FINES =====

app.get("/fines", async (req, res) => {
  try {
    const { user_id } = req.query;
    let sql = `
      SELECT f.id, f.user_id, CONCAT(u.first_name,' ',u.last_name) AS student,
             f.borrowing_id, bk.title AS book_title,
             f.amount, f.reason, f.days_overdue, f.status, f.payment_date, f.created_at
      FROM fines f
      JOIN users u ON f.user_id = u.id
      LEFT JOIN borrowing bw ON f.borrowing_id = bw.id
      LEFT JOIN books bk ON bw.book_id = bk.id
    `;
    const params = [];
    if (user_id) { sql += " WHERE f.user_id=?"; params.push(user_id); }
    sql += " ORDER BY f.created_at DESC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch fines" });
  }
});

app.post("/fines", async (req, res) => {
  try {
    const { user_id, borrowing_id, amount, reason, days_overdue } = req.body;
    if (!user_id || !amount || !reason)
      return res.status(400).json({ success: false, message: "Required fields missing" });

    await db.query(
      "INSERT INTO fines (user_id, borrowing_id, amount, reason, days_overdue, status) VALUES (?,?,?,?,?,?)",
      [user_id, borrowing_id || null, amount, reason, days_overdue || 0, "pending"]
    );
    res.json({ success: true, message: "Fine added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to add fine" });
  }
});

app.patch("/fines/:id/pay", async (req, res) => {
  try {
    await db.query("UPDATE fines SET status='paid', payment_date=NOW() WHERE id=?", [req.params.id]);
    res.json({ success: true, message: "Fine marked as paid" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update fine" });
  }
});

app.patch("/fines/:id/waive", async (req, res) => {
  try {
    await db.query("UPDATE fines SET status='waived', payment_date=NULL WHERE id=?", [req.params.id]);
    res.json({ success: true, message: "Fine waived" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to waive fine" });
  }
});

app.delete("/fines/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM fines WHERE id=?", [req.params.id]);
    res.json({ success: true, message: "Fine deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete fine" });
  }
});

// ===== START SERVER =====
app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));