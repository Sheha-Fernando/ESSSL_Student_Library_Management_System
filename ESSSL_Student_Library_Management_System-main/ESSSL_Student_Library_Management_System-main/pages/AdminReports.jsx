import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import "../styles/AdminReports.css";

const API = "http://localhost:5000";

const fmtAmount = (amt) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amt || 0);

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomBarTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="arp-tooltip">
        <p className="arp-tooltip-label">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="arp-tooltip-val" style={{ color: p.color }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function CustomPieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="arp-tooltip">
        <p className="arp-tooltip-label">{payload[0].name}</p>
        <p className="arp-tooltip-val" style={{ color: payload[0].payload.fill }}>
          Count: <strong>{payload[0].value}</strong>
        </p>
      </div>
    );
  }
  return null;
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function AdminReports() {
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [fines, setFines] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, studentsRes, reservationsRes, finesRes, borrowRes] = await Promise.all([
          axios.get(`${API}/books`),
          axios.get(`${API}/users?role=student`),
          axios.get(`${API}/reservations`),
          axios.get(`${API}/fines`),
          axios.get(`${API}/borrowing`),
        ]);
        setBooks(Array.isArray(booksRes.data) ? booksRes.data : []);
        setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
        setReservations(Array.isArray(reservationsRes.data) ? reservationsRes.data : []);
        setFines(Array.isArray(finesRes.data) ? finesRes.data : []);
        setBorrowings(Array.isArray(borrowRes.data) ? borrowRes.data : []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Metrics ────────────────────────────────────────────────────────────────
  const totalBooks        = books.length;
  const totalStudents     = students.length;
  const totalReservations = reservations.length;
  const borrowedBooks     = books.filter((b) => b.available_copies < b.total_copies).length;
  const availableBooks    = books.reduce((s, b) => s + (b.available_copies || 0), 0);
  const pendingFines      = fines.filter((f) => f.status === "pending").length;
  const totalFineAmount   = fines
    .filter((f) => f.status === "pending")
    .reduce((s, f) => s + parseFloat(f.amount || 0), 0);
  const activeBorrows     = borrowings.filter((b) => b.status === "Borrowed").length;

  // ── Date filter helper ─────────────────────────────────────────────────────
  const inRange = (dateStr) => {
    if (!dateRange.from && !dateRange.to) return true;
    const d = new Date(dateStr);
    if (dateRange.from && d < new Date(dateRange.from)) return false;
    if (dateRange.to   && d > new Date(dateRange.to))   return false;
    return true;
  };

  // ── Books per Category ─────────────────────────────────────────────────────
  const filteredBooks = categoryFilter
    ? books.filter((b) => b.category === categoryFilter)
    : books;

  const booksPerCategory = Object.values(
    filteredBooks.reduce((acc, b) => {
      const cat = b.category || "Uncategorized";
      acc[cat] = acc[cat] || { category: cat, books: 0, available: 0 };
      acc[cat].books += 1;
      acc[cat].available += b.available_copies || 0;
      return acc;
    }, {})
  );

  // ── Reservations by status ─────────────────────────────────────────────────
  const filteredReservations = reservations.filter((r) => inRange(r.reservation_date));
  const reservationsStatus = ["waiting", "ready", "completed", "cancelled"].map((s) => ({
    status: s.charAt(0).toUpperCase() + s.slice(1),
    value: filteredReservations.filter((r) => r.status === s).length,
  }));

  // ── Fines by status ────────────────────────────────────────────────────────
  const finesStatus = ["pending", "paid", "waived"].map((s) => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: fines.filter((f) => f.status === s).length,
  }));

  // ── Borrowings by status ───────────────────────────────────────────────────
  const borrowStatus = ["Borrowed", "Returned", "Overdue"].map((s) => ({
    name: s,
    value: borrowings.filter((b) => b.status === s).length,
  }));

  // ── Monthly borrowings trend ───────────────────────────────────────────────
  const monthlyBorrows = borrowings
    .filter((b) => inRange(b.borrow_date))
    .reduce((acc, b) => {
      const month = new Date(b.borrow_date).toLocaleDateString("en-GB", {
        month: "short", year: "2-digit",
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

  const trendData = Object.entries(monthlyBorrows)
    .slice(-8)
    .map(([month, count]) => ({ month, borrows: count }));

  // ── Fine reason breakdown ──────────────────────────────────────────────────
  const fineReasons = Object.values(
    fines.reduce((acc, f) => {
      const r = f.reason || "Other";
      acc[r] = acc[r] || { reason: r, count: 0, amount: 0 };
      acc[r].count += 1;
      acc[r].amount += parseFloat(f.amount || 0);
      return acc;
    }, {})
  );

  // ── Colors ─────────────────────────────────────────────────────────────────
  const PIE_COLORS_RES   = ["#f59e0b", "#22c55e", "#3b82f6", "#ef4444"];
  const PIE_COLORS_FINES = ["#f59e0b", "#22c55e", "#6366f1"];
  const PIE_COLORS_BRW   = ["#6366f1", "#22c55e", "#ef4444"];

  const categories = Array.from(new Set(books.map((b) => b.category).filter(Boolean)));

  return (
    <DashboardLayout userRole="admin">
      <div className="arp-root">

        {/* ══ HERO ════════════════════════════════════════ */}
        <div className="arp-hero">
          <div className="arp-hero-blob arp-hero-blob--1" />
          <div className="arp-hero-blob arp-hero-blob--2" />
          <div className="arp-hero-blob arp-hero-blob--3" />
          <div className="arp-hero-inner">
            <div className="arp-hero-left">
              <div className="arp-hero-eyebrow">📊 Admin Panel</div>
              <h1 className="arp-hero-title">
                Reports & <em className="arp-hero-em">Analytics</em>
              </h1>
              <p className="arp-hero-desc">
                Live library statistics, visual breakdowns, and trends. Monitor every aspect of your library at a glance.
              </p>
            </div>
            <div className="arp-hero-chips">
              {[
                { icon: "📚", num: totalBooks,        label: "Books",      cls: "chip--blue"   },
                { icon: "🎓", num: totalStudents,     label: "Students",   cls: "chip--purple" },
                { icon: "🔖", num: totalReservations, label: "Reservations", cls: "chip--amber" },
                { icon: "📖", num: activeBorrows,     label: "Borrowed",   cls: "chip--green"  },
              ].map((c) => (
                <div key={c.label} className={`arp-chip ${c.cls}`}>
                  <span className="arp-chip-icon">{c.icon}</span>
                  <span className="arp-chip-num">{c.num}</span>
                  <span className="arp-chip-label">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ METRIC CARDS ════════════════════════════════ */}
        <div className="arp-metrics-wrap">
          {[
            { icon: "📚", label: "Total Books",       value: totalBooks,           sub: `${availableBooks} available`,    cls: "metric--blue"   },
            { icon: "🎓", label: "Registered Students", value: totalStudents,      sub: "Active learners",                cls: "metric--purple" },
            { icon: "📖", label: "Active Borrows",    value: activeBorrows,         sub: `${borrowedBooks} unique titles`, cls: "metric--green"  },
            { icon: "🔖", label: "Reservations",      value: totalReservations,    sub: `${reservations.filter(r=>r.status==='waiting').length} waiting`, cls: "metric--amber" },
            { icon: "💰", label: "Pending Fines",     value: pendingFines,         sub: fmtAmount(totalFineAmount),       cls: "metric--red"    },
          ].map((m) => (
            <div key={m.label} className={`arp-metric-card ${m.cls}`}>
              <div className="arp-metric-icon">{m.icon}</div>
              <div className="arp-metric-body">
                <span className="arp-metric-label">{m.label}</span>
                <span className="arp-metric-value">{m.value}</span>
                <span className="arp-metric-sub">{m.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ══ FILTERS ═════════════════════════════════════ */}
        <div className="arp-section-wrap">
          <div className="arp-section-header">
            <h2 className="arp-section-title">🔎 Filter Data</h2>
            <p className="arp-section-desc">Narrow charts by category or date range</p>
          </div>
          <div className="arp-filter-card">
            <div className="arp-filter-group">
              <label className="arp-label">Book Category</label>
              <select
                className="arp-input"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="arp-filter-group">
              <label className="arp-label">From Date</label>
              <input
                className="arp-input"
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </div>
            <div className="arp-filter-group">
              <label className="arp-label">To Date</label>
              <input
                className="arp-input"
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
            {(categoryFilter || dateRange.from || dateRange.to) && (
              <button
                className="arp-clear-btn"
                onClick={() => { setCategoryFilter(""); setDateRange({ from: "", to: "" }); }}
              >
                ✕ Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* ══ CHARTS ══════════════════════════════════════ */}
        {loading ? (
          <div className="arp-loading">
            <div className="arp-loading-spin" />
            <p>Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Row 1: Books per category + Reservations status */}
            <div className="arp-chart-grid">
              <div className="arp-chart-card">
                <div className="arp-chart-header">
                  <div className="arp-chart-title-wrap">
                    <span className="arp-chart-icon">📚</span>
                    <div>
                      <h3 className="arp-chart-title">Books per Category</h3>
                      <p className="arp-chart-desc">Total vs available copies by category</p>
                    </div>
                  </div>
                  <span className="arp-chart-badge">{booksPerCategory.length} categories</span>
                </div>
                <div className="arp-chart-body">
                  {booksPerCategory.length === 0 ? (
                    <div className="arp-chart-empty">No data available</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={booksPerCategory} barGap={4} barSize={22}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomBarTooltip />} />
                        <Bar dataKey="books"     name="Total"     fill="#6366f1" radius={[6,6,0,0]} />
                        <Bar dataKey="available" name="Available" fill="#a5b4fc" radius={[6,6,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="arp-chart-card">
                <div className="arp-chart-header">
                  <div className="arp-chart-title-wrap">
                    <span className="arp-chart-icon">🔖</span>
                    <div>
                      <h3 className="arp-chart-title">Reservation Status</h3>
                      <p className="arp-chart-desc">Breakdown of all reservation states</p>
                    </div>
                  </div>
                  <span className="arp-chart-badge">{filteredReservations.length} total</span>
                </div>
                <div className="arp-chart-body">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={reservationsStatus.filter((d) => d.value > 0)}
                        dataKey="value"
                        nameKey="status"
                        cx="50%"
                        cy="45%"
                        outerRadius={85}
                        innerRadius={45}
                        paddingAngle={3}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                      >
                        {reservationsStatus.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS_RES[i % PIE_COLORS_RES.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        formatter={(v) => <span style={{ fontSize: 12, color: "#64748b" }}>{v}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 2: Monthly borrowing trend */}
            <div className="arp-section-wrap" style={{ marginTop: 0 }}>
              <div className="arp-chart-card arp-chart-card--wide">
                <div className="arp-chart-header">
                  <div className="arp-chart-title-wrap">
                    <span className="arp-chart-icon">📈</span>
                    <div>
                      <h3 className="arp-chart-title">Borrowing Trend</h3>
                      <p className="arp-chart-desc">Monthly borrowing activity over time</p>
                    </div>
                  </div>
                  <span className="arp-chart-badge">{borrowings.length} total borrows</span>
                </div>
                <div className="arp-chart-body">
                  {trendData.length === 0 ? (
                    <div className="arp-chart-empty">No borrowing data available</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="arpGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomBarTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="borrows"
                          name="Borrows"
                          stroke="#6366f1"
                          strokeWidth={2.5}
                          fill="url(#arpGrad)"
                          dot={{ fill: "#6366f1", r: 4, strokeWidth: 0 }}
                          activeDot={{ r: 6, fill: "#4f46e5" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Row 3: Fines + Borrowing status */}
            <div className="arp-chart-grid">
              <div className="arp-chart-card">
                <div className="arp-chart-header">
                  <div className="arp-chart-title-wrap">
                    <span className="arp-chart-icon">💰</span>
                    <div>
                      <h3 className="arp-chart-title">Fines Overview</h3>
                      <p className="arp-chart-desc">Pending, paid, and waived fines</p>
                    </div>
                  </div>
                  <span className="arp-chart-badge">{fines.length} total</span>
                </div>
                <div className="arp-chart-body">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={finesStatus} barSize={36}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Bar dataKey="value" name="Fines" radius={[8,8,0,0]}>
                        {finesStatus.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS_FINES[i % PIE_COLORS_FINES.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="arp-chart-card">
                <div className="arp-chart-header">
                  <div className="arp-chart-title-wrap">
                    <span className="arp-chart-icon">📖</span>
                    <div>
                      <h3 className="arp-chart-title">Borrowing Status</h3>
                      <p className="arp-chart-desc">Current state of all borrowing records</p>
                    </div>
                  </div>
                  <span className="arp-chart-badge">{borrowings.length} records</span>
                </div>
                <div className="arp-chart-body">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={borrowStatus.filter((d) => d.value > 0)}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        outerRadius={80}
                        innerRadius={40}
                        paddingAngle={3}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                      >
                        {borrowStatus.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS_BRW[i % PIE_COLORS_BRW.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        formatter={(v) => <span style={{ fontSize: 12, color: "#64748b" }}>{v}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 4: Fine reasons table */}
            {fineReasons.length > 0 && (
              <div className="arp-section-wrap" style={{ marginTop: 0 }}>
                <div className="arp-chart-card arp-chart-card--wide">
                  <div className="arp-chart-header">
                    <div className="arp-chart-title-wrap">
                      <span className="arp-chart-icon">📋</span>
                      <div>
                        <h3 className="arp-chart-title">Fine Reasons Breakdown</h3>
                        <p className="arp-chart-desc">Count and total amount per fine reason</p>
                      </div>
                    </div>
                  </div>
                  <div className="arp-table-wrap">
                    <table className="arp-table">
                      <thead>
                        <tr>
                          <th>Reason</th>
                          <th>Count</th>
                          <th>Total Amount</th>
                          <th>Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fineReasons.sort((a, b) => b.count - a.count).map((r) => {
                          const pct = fines.length > 0 ? Math.round((r.count / fines.length) * 100) : 0;
                          return (
                            <tr key={r.reason}>
                              <td className="arp-table-reason">{r.reason}</td>
                              <td>
                                <span className="arp-table-badge">{r.count}</span>
                              </td>
                              <td className="arp-table-amount">{fmtAmount(r.amount)}</td>
                              <td>
                                <div className="arp-progress-wrap">
                                  <div className="arp-progress-bar">
                                    <div className="arp-progress-fill" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="arp-progress-pct">{pct}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}