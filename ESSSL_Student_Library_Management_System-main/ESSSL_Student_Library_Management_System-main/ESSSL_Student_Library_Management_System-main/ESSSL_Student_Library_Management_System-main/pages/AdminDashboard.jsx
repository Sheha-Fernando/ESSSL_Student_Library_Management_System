import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/adminDashboard.css";

const API = "http://localhost:5000";

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtTime = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="adb-toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`adb-toast adb-toast--${t.type}`}>
          <span className="adb-toast-icon">
            {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}
          </span>
          <span className="adb-toast-msg">{t.message}</span>
          <button className="adb-toast-x" onClick={() => remove(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ── Priority badge ────────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const map = {
    High:   { cls: "high",   label: "● High"   },
    Medium: { cls: "medium", label: "● Medium" },
    Low:    { cls: "low",    label: "● Low"    },
  };
  const p = map[priority] || { cls: "low", label: priority };
  return <span className={`adb-priority adb-priority--${p.cls}`}>{p.label}</span>;
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("user") || "{}");

  const [metrics, setMetrics] = useState({
    totalBooks: 0,
    activeStudents: 0,
    activeBorrows: 0,
    pendingFines: 0,
    overdueBooks: 0,
    reservationsReady: 0,
  });
  const [tasks, setTasks] = useState([]);
  const [recentBorrows, setRecentBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const removeToast = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  useEffect(() => {
    const load = async () => {
      try {
        const [booksRes, studentsRes, borrowsRes, tasksRes, finesRes, reservRes] = await Promise.all([
          axios.get(`${API}/books`),
          axios.get(`${API}/users`, { params: { role: "student" } }),
          axios.get(`${API}/borrowing`),
          axios.get(`${API}/tasks`),
          axios.get(`${API}/fines`),
          axios.get(`${API}/reservations`),
        ]);

        const books    = booksRes.data    || [];
        const students = studentsRes.data || [];
        const borrows  = borrowsRes.data  || [];
        const fines    = finesRes.data    || [];
        const reservs  = reservRes.data   || [];

        const today = new Date(); today.setHours(0, 0, 0, 0);
        const activeBorrows     = borrows.filter((b) => b.status !== "Returned");
        const overdueBooks      = activeBorrows.filter((b) => {
          const due = new Date(b.due_date); due.setHours(0, 0, 0, 0);
          return due < today;
        });

        setMetrics({
          totalBooks:        books.length,
          activeStudents:    students.filter((s) => s.is_active).length,
          activeBorrows:     activeBorrows.length,
          pendingFines:      fines.filter((f) => f.status === "pending").length,
          overdueBooks:      overdueBooks.length,
          reservationsReady: reservs.filter((r) => r.status === "ready").length,
        });

        setTasks(tasksRes.data || []);
        setRecentBorrows(borrows.slice(0, 8));
      } catch {
        addToast("Failed to load dashboard data.", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [addToast]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const adminName = admin?.first_name || "Admin";

  return (
    <DashboardLayout userRole="admin">
      <div className="adb-root">

        {/* ══ HERO ════════════════════════════════════════ */}
        <div className="adb-hero">
          <div className="adb-hero-blob adb-hero-blob--1" />
          <div className="adb-hero-blob adb-hero-blob--2" />
          <div className="adb-hero-blob adb-hero-blob--3" />

          <div className="adb-hero-inner">
            <div className="adb-hero-left">
              <div className="adb-hero-eyebrow">🛡️ Admin Panel</div>
              <h1 className="adb-hero-title">
                {greeting}, <em className="adb-hero-em">{adminName}</em>
              </h1>
              <p className="adb-hero-desc">
                Here's a live overview of your library operations. Monitor activity, manage tasks, and keep everything running smoothly.
              </p>
              <div className="adb-hero-date">
                📅 {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="adb-hero-actions">
              <button className="adb-quick-btn adb-quick-btn--primary" onClick={() => navigate("/admin/books")}>
                <span>📚</span> Manage Books
              </button>
              <button className="adb-quick-btn adb-quick-btn--secondary" onClick={() => navigate("/admin/students")}>
                <span>👥</span> View Students
              </button>
              <button className="adb-quick-btn adb-quick-btn--secondary" onClick={() => navigate("/admin/borrowing")}>
                <span>🔄</span> Borrowings
              </button>
              <button className="adb-quick-btn adb-quick-btn--secondary" onClick={() => navigate("/admin/fines")}>
                <span>💰</span> Fines
              </button>
            </div>
          </div>
        </div>

        {/* ══ ALERT — overdue books ════════════════════════ */}
        {!loading && metrics.overdueBooks > 0 && (
          <div className="adb-alert-overdue">
            <span className="adb-alert-icon">⚠️</span>
            <div>
              <strong>Overdue Books Require Attention</strong>
              <p>{metrics.overdueBooks} book{metrics.overdueBooks > 1 ? "s are" : " is"} past the due date. Review them in the Borrowings section.</p>
            </div>
            <button className="adb-alert-action" onClick={() => navigate("/admin/borrowing")}>
              View Borrowings →
            </button>
          </div>
        )}

        {/* ══ METRICS GRID ════════════════════════════════ */}
        <div className="adb-metrics">
          {[
            { icon: "📚", label: "Total Books",        val: metrics.totalBooks,        cls: "blue",   nav: "/admin/books"      },
            { icon: "👥", label: "Active Students",    val: metrics.activeStudents,    cls: "green",  nav: "/admin/students"   },
            { icon: "🔄", label: "Active Borrows",     val: metrics.activeBorrows,     cls: "indigo", nav: "/admin/borrowing"  },
            { icon: "⚠️", label: "Overdue Books",      val: metrics.overdueBooks,      cls: "red",    nav: "/admin/borrowing"  },
            { icon: "💰", label: "Pending Fines",      val: metrics.pendingFines,      cls: "amber",  nav: "/admin/fines"      },
            { icon: "🔖", label: "Ready Reservations", val: metrics.reservationsReady, cls: "teal",   nav: "/admin/reservations"},
          ].map((m, i) => (
            <div
              key={m.label}
              className={`adb-metric-card adb-metric-card--${m.cls}`}
              style={{ animationDelay: `${i * 0.07}s` }}
              onClick={() => navigate(m.nav)}
            >
              <div className="adb-metric-icon">{m.icon}</div>
              <div className="adb-metric-body">
                <div className="adb-metric-val">{loading ? "—" : m.val}</div>
                <div className="adb-metric-label">{m.label}</div>
              </div>
              <div className="adb-metric-arrow">→</div>
            </div>
          ))}
        </div>

        {/* ══ TWO-COLUMN LAYOUT ═══════════════════════════ */}
        <div className="adb-two-col">

          {/* ── Pending Tasks ── */}
          <div className="adb-panel">
            <div className="adb-panel-header">
              <div>
                <h2 className="adb-panel-title">Pending Tasks</h2>
                <p className="adb-panel-sub">Action items that need your attention</p>
              </div>
              <span className="adb-panel-count">{tasks.length}</span>
            </div>

            {loading ? (
              <div className="adb-panel-loading"><div className="adb-spin" /></div>
            ) : tasks.length === 0 ? (
              <div className="adb-panel-empty">
                <div className="adb-panel-empty-icon">✅</div>
                <p>All tasks complete!</p>
              </div>
            ) : (
              <div className="adb-task-list">
                {tasks.map((task, i) => (
                  <div key={task.id} className="adb-task-row" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="adb-task-left">
                      <div className="adb-task-dot" />
                      <div>
                        <div className="adb-task-title">{task.title}</div>
                        <div className="adb-task-due">Due: {fmtDate(task.dueDate)}</div>
                      </div>
                    </div>
                    <PriorityBadge priority={task.priority} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Recent Borrowing Activity ── */}
          <div className="adb-panel">
            <div className="adb-panel-header">
              <div>
                <h2 className="adb-panel-title">Recent Activity</h2>
                <p className="adb-panel-sub">Latest borrowing transactions</p>
              </div>
              <button className="adb-panel-link" onClick={() => navigate("/admin/borrowing")}>
                View All →
              </button>
            </div>

            {loading ? (
              <div className="adb-panel-loading"><div className="adb-spin" /></div>
            ) : recentBorrows.length === 0 ? (
              <div className="adb-panel-empty">
                <div className="adb-panel-empty-icon">📭</div>
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="adb-activity-list">
                {recentBorrows.map((b, i) => {
                  const isReturned = b.status === "Returned";
                  const due = new Date(b.due_date); due.setHours(0, 0, 0, 0);
                  const today = new Date(); today.setHours(0, 0, 0, 0);
                  const isOverdue = !isReturned && due < today;
                  return (
                    <div key={b.id} className="adb-activity-row" style={{ animationDelay: `${i * 0.04}s` }}>
                      <div className="adb-activity-avatar">
                        {(b.student_name || "?")[0].toUpperCase()}
                      </div>
                      <div className="adb-activity-info">
                        <div className="adb-activity-name">{b.student_name || "Unknown"}</div>
                        <div className="adb-activity-book">📖 {b.book_title}</div>
                        <div className="adb-activity-date">
                          Borrowed {fmtDate(b.borrow_date)} · Due {fmtDate(b.due_date)}
                        </div>
                      </div>
                      <span className={`adb-activity-status ${isReturned ? "returned" : isOverdue ? "overdue" : "active"}`}>
                        {isReturned ? "✓ Returned" : isOverdue ? "⚠ Overdue" : "● Active"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ══ QUICK STATS ROW ═════════════════════════════ */}
        <div className="adb-stats-row">
          {[
            { icon: "📈", label: "System Status",    val: "Operational",  sub: "All services running",       cls: "green"  },
            { icon: "🗄️", label: "Database",         val: "Connected",    sub: "MySQL pool active",           cls: "blue"   },
            { icon: "📦", label: "Storage",          val: "Uploads Ready", sub: "File uploads enabled",       cls: "indigo" },
            { icon: "🔐", label: "Auth",             val: "Secure",        sub: "bcrypt + session active",    cls: "purple" },
          ].map((s) => (
            <div key={s.label} className={`adb-stat-card adb-stat-card--${s.cls}`}>
              <div className="adb-stat-icon">{s.icon}</div>
              <div className="adb-stat-body">
                <div className="adb-stat-val">{s.val}</div>
                <div className="adb-stat-label">{s.label}</div>
                <div className="adb-stat-sub">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

      </div>

      <Toast toasts={toasts} remove={removeToast} />
    </DashboardLayout>
  );
}