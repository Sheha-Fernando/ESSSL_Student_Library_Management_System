import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
import "../styles/AdminReservationManagement.css";

const API = "http://localhost:5000";

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const STATUS_META = {
  waiting:   { cls: "waiting",   label: "⏳ Waiting",   color: "amber"  },
  ready:     { cls: "ready",     label: "✅ Ready",     color: "green"  },
  completed: { cls: "completed", label: "✓ Completed", color: "blue"   },
  cancelled: { cls: "cancelled", label: "✕ Cancelled", color: "red"    },
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="arm-toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`arm-toast arm-toast--${t.type}`}>
          <span className="arm-toast-icon">{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
          <span className="arm-toast-msg">{t.message}</span>
          <button className="arm-toast-x" onClick={() => remove(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ reservation, onClose, onConfirm, loading }) {
  return (
    <div className="arm-backdrop" onClick={onClose}>
      <div className="arm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="arm-modal-top">
          <div className="arm-modal-icon arm-modal-icon--delete">🗑️</div>
          <div>
            <h3 className="arm-modal-title">Delete Reservation</h3>
            <p className="arm-modal-sub">This action cannot be undone</p>
          </div>
          <button className="arm-modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="arm-modal-res-row">
          <div className="arm-modal-avatar">
            {reservation.student_name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="arm-modal-res-info">
            <h4>{reservation.student_name}</h4>
            <p>📖 {reservation.book_title}</p>
            <p className="arm-modal-date">Pickup by: {fmtDate(reservation.pickup_deadline)}</p>
          </div>
        </div>
        <div className="arm-modal-warning">
          ⚠️ Deleting this reservation will permanently remove it from the system.
        </div>
        <div className="arm-modal-footer">
          <button className="arm-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="arm-btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <><span className="arm-spinner-sm" /> Deleting...</> : "🗑️ Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Status Change Modal ───────────────────────────────────────────────────────
function StatusModal({ reservation, onClose, onConfirm, loading }) {
  const [selectedStatus, setSelectedStatus] = useState(reservation.status);
  const statuses = ["waiting", "ready", "completed", "cancelled"];

  return (
    <div className="arm-backdrop" onClick={onClose}>
      <div className="arm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="arm-modal-top">
          <div className="arm-modal-icon arm-modal-icon--status">🔖</div>
          <div>
            <h3 className="arm-modal-title">Update Status</h3>
            <p className="arm-modal-sub">{reservation.student_name} · {reservation.book_title}</p>
          </div>
          <button className="arm-modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="arm-status-options">
          {statuses.map((s) => {
            const meta = STATUS_META[s];
            return (
              <button
                key={s}
                className={`arm-status-opt arm-status-opt--${meta.color} ${selectedStatus === s ? "selected" : ""}`}
                onClick={() => setSelectedStatus(s)}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
        <div className="arm-modal-footer">
          <button className="arm-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button
            className="arm-btn-primary"
            onClick={() => onConfirm(selectedStatus)}
            disabled={loading || selectedStatus === reservation.status}
          >
            {loading ? <><span className="arm-spinner-sm" /> Updating...</> : "✅ Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Reservation Drawer ────────────────────────────────────────────────────
function AddDrawer({ students, books, onSave, onClose, loading }) {
  const [form, setForm] = useState({ user_id: "", book_id: "", pickup_deadline: "" });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = () => onSave(form);

  return (
    <div className="arm-drawer-backdrop" onClick={onClose}>
      <div className="arm-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="arm-drawer-header">
          <div className="arm-drawer-icon">🔖</div>
          <div>
            <h2 className="arm-drawer-title">Add Reservation</h2>
            <p className="arm-drawer-sub">Create a new book reservation for a student</p>
          </div>
          <button className="arm-drawer-close" onClick={onClose}>✕</button>
        </div>

        <div className="arm-drawer-body">
          <div className="arm-form-stack">
            <div className="arm-field">
              <label className="arm-label">Student <span className="arm-req">*</span></label>
              <select className="arm-input" name="user_id" value={form.user_id} onChange={handleChange}>
                <option value="">Select a student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                ))}
              </select>
            </div>
            <div className="arm-field">
              <label className="arm-label">Book <span className="arm-req">*</span></label>
              <select className="arm-input" name="book_id" value={form.book_id} onChange={handleChange}>
                <option value="">Select a book</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>{b.title} — {b.author}</option>
                ))}
              </select>
            </div>
            <div className="arm-field">
              <label className="arm-label">Pickup Deadline <span className="arm-req">*</span></label>
              <input
                className="arm-input"
                type="date"
                name="pickup_deadline"
                value={form.pickup_deadline}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
        </div>

        <div className="arm-drawer-footer">
          <button className="arm-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="arm-btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? <><span className="arm-spinner-sm" /> Adding...</> : "🔖 Add Reservation"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reservation Row ───────────────────────────────────────────────────────────
function ReservationRow({ reservation: r, idx, onStatusChange, onDelete }) {
  const meta = STATUS_META[r.status] || STATUS_META.waiting;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const deadline = new Date(r.pickup_deadline); deadline.setHours(0, 0, 0, 0);
  const isExpired = r.status === "waiting" && deadline < today;

  const avatarColors = [
    "linear-gradient(135deg,#6366f1,#8b5cf6)",
    "linear-gradient(135deg,#3b82f6,#2563eb)",
    "linear-gradient(135deg,#10b981,#059669)",
    "linear-gradient(135deg,#f59e0b,#d97706)",
    "linear-gradient(135deg,#ef4444,#dc2626)",
    "linear-gradient(135deg,#8b5cf6,#7c3aed)",
  ];
  const color = avatarColors[r.id % avatarColors.length];
  const initials = r.student_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className="arm-res-row" style={{ animationDelay: `${Math.min(idx * 0.04, 0.4)}s` }}>
      <div className="arm-res-avatar" style={{ background: color }}>{initials}</div>

      <div className="arm-res-info">
        <div className="arm-res-name-row">
          <h3 className="arm-res-name">{r.student_name}</h3>
          <span className={`arm-status-badge arm-status-badge--${meta.color}`}>{meta.label}</span>
          {isExpired && <span className="arm-expired-badge">⚠ Deadline Passed</span>}
        </div>
        <p className="arm-res-book">📖 {r.book_title}</p>
        <div className="arm-res-meta">
          <span className="arm-res-tag">📅 Reserved: {fmtDate(r.reservation_date)}</span>
          <span className={`arm-res-tag ${isExpired ? "tag--red" : ""}`}>
            🕒 Pickup by: {fmtDate(r.pickup_deadline)}
          </span>
          <span className="arm-res-tag">ID: #{r.id}</span>
        </div>
      </div>

      <div className="arm-res-actions">
        <button className="arm-row-btn arm-row-btn--status" onClick={() => onStatusChange(r)}>
          🔄 Status
        </button>
        <button className="arm-row-btn arm-row-btn--delete" onClick={() => onDelete(r)}>
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function AdminReservationManagement() {
  const [reservations, setReservations] = useState([]);
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDrawer, setShowDrawer] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const removeToast = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  const fetchReservations = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/reservations`);
      setReservations(Array.isArray(res.data) ? res.data : []);
    } catch {
      addToast("Failed to load reservations.", "error");
    } finally {
      setPageLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resv, stud, bks] = await Promise.all([
          axios.get(`${API}/reservations`),
          axios.get(`${API}/users`, { params: { role: "student" } }),
          axios.get(`${API}/books`),
        ]);
        setReservations(Array.isArray(resv.data) ? resv.data : []);
        setStudents(Array.isArray(stud.data) ? stud.data : []);
        setBooks(Array.isArray(bks.data) ? bks.data : []);
      } catch {
        addToast("Failed to load data.", "error");
      } finally {
        setPageLoading(false);
      }
    };
    fetchAll();
  }, [addToast]);

  const handleAdd = async (form) => {
    if (!form.user_id || !form.book_id || !form.pickup_deadline) {
      addToast("Please fill in all required fields.", "error");
      return;
    }
    setActionLoading(true);
    try {
      await axios.post(`${API}/reservations`, {
        user_id: form.user_id,
        book_id: form.book_id,
        pickup_deadline: form.pickup_deadline,
      });
      addToast("Reservation added successfully!", "success");
      setShowDrawer(false);
      fetchReservations();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to add reservation.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!statusModal) return;
    setActionLoading(true);
    try {
      await axios.patch(`${API}/reservations/${statusModal.id}/status`, { status: newStatus });
      setReservations((p) =>
        p.map((r) => r.id === statusModal.id ? { ...r, status: newStatus } : r)
      );
      addToast(`Status updated to "${newStatus}".`, "success");
      setStatusModal(null);
    } catch {
      addToast("Failed to update status.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setActionLoading(true);
    try {
      await axios.delete(`${API}/reservations/${deleteModal.id}`);
      setReservations((p) => p.filter((r) => r.id !== deleteModal.id));
      addToast("Reservation deleted.", "info");
      setDeleteModal(null);
    } catch {
      addToast("Failed to delete reservation.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered list
  const displayed = reservations.filter((r) => {
    const matchSearch = [r.student_name, r.book_title, r.status]
      .join(" ").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Metrics
  const waiting   = reservations.filter((r) => r.status === "waiting").length;
  const ready     = reservations.filter((r) => r.status === "ready").length;
  const completed = reservations.filter((r) => r.status === "completed").length;
  const cancelled = reservations.filter((r) => r.status === "cancelled").length;

  return (
    <DashboardLayout userRole="admin">
      <div className="arm-root">

        {/* ══ HERO ════════════════════════════════════════ */}
        <div className="arm-hero">
          <div className="arm-hero-blob arm-hero-blob--1" />
          <div className="arm-hero-blob arm-hero-blob--2" />
          <div className="arm-hero-blob arm-hero-blob--3" />
          <div className="arm-hero-inner">
            <div className="arm-hero-left">
              <div className="arm-hero-eyebrow">🔖 Admin Panel</div>
              <h1 className="arm-hero-title">
                Reservation <em className="arm-hero-em">Management</em>
              </h1>
              <p className="arm-hero-desc">
                Track and manage student book reservations. Update statuses and monitor pickup deadlines in real time.
              </p>
            </div>
            <div className="arm-hero-chips">
              {[
                { icon: "🔖", num: reservations.length, label: "Total",     cls: "chip--blue"   },
                { icon: "⏳", num: waiting,             label: "Waiting",   cls: "chip--amber"  },
                { icon: "✅", num: ready,               label: "Ready",     cls: "chip--green"  },
                { icon: "✓",  num: completed,           label: "Completed", cls: "chip--purple" },
              ].map((c) => (
                <div key={c.label} className={`arm-chip ${c.cls}`}>
                  <span className="arm-chip-icon">{c.icon}</span>
                  <span className="arm-chip-num">{c.num}</span>
                  <span className="arm-chip-label">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ TOOLBAR ═════════════════════════════════════ */}
        <div className="arm-toolbar">
          <div className="arm-toolbar-left">
            <div className="arm-search-wrap">
              <span className="arm-search-icon">🔍</span>
              <input
                className="arm-search"
                type="text"
                placeholder="Search student, book, or status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && <button className="arm-search-clear" onClick={() => setSearch("")}>✕</button>}
            </div>
            <select className="arm-filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="waiting">Waiting</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button className="arm-add-btn" onClick={() => setShowDrawer(true)}>
            ➕ Add Reservation
          </button>
        </div>

        {/* ══ RESULTS INFO ════════════════════════════════ */}
        {!pageLoading && (
          <div className="arm-results-info">
            Showing <strong>{displayed.length}</strong> of <strong>{reservations.length}</strong> reservations
            {(search || filterStatus !== "all") && (
              <button className="arm-clear-filters" onClick={() => { setSearch(""); setFilterStatus("all"); }}>
                Clear filters ✕
              </button>
            )}
          </div>
        )}

        {/* ══ CONTENT ══════════════════════════════════════ */}
        <div className="arm-content">
          {pageLoading ? (
            <div className="arm-loading">
              <div className="arm-loading-spin" />
              <p>Loading reservations...</p>
            </div>
          ) : displayed.length === 0 ? (
            <div className="arm-empty">
              <div className="arm-empty-icon">{reservations.length === 0 ? "🔖" : "🔍"}</div>
              <h3>{reservations.length === 0 ? "No reservations yet" : "No reservations match your search"}</h3>
              <p>{reservations.length === 0 ? "Create the first reservation for a student." : "Try adjusting your search or filters."}</p>
              {reservations.length === 0 ? (
                <button className="arm-empty-btn" onClick={() => setShowDrawer(true)}>➕ Add First Reservation</button>
              ) : (
                <button className="arm-empty-btn" onClick={() => { setSearch(""); setFilterStatus("all"); }}>Clear Filters</button>
              )}
            </div>
          ) : (
            <div className="arm-res-list">
              {displayed.map((r, i) => (
                <ReservationRow
                  key={r.id}
                  reservation={r}
                  idx={i}
                  onStatusChange={(res) => setStatusModal(res)}
                  onDelete={(res) => setDeleteModal(res)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ DRAWER ══ */}
      {showDrawer && (
        <AddDrawer
          students={students}
          books={books}
          onSave={handleAdd}
          onClose={() => { if (!actionLoading) setShowDrawer(false); }}
          loading={actionLoading}
        />
      )}

      {/* ══ STATUS MODAL ══ */}
      {statusModal && (
        <StatusModal
          reservation={statusModal}
          onClose={() => !actionLoading && setStatusModal(null)}
          onConfirm={handleStatusUpdate}
          loading={actionLoading}
        />
      )}

      {/* ══ DELETE MODAL ══ */}
      {deleteModal && (
        <DeleteModal
          reservation={deleteModal}
          onClose={() => !actionLoading && setDeleteModal(null)}
          onConfirm={handleDelete}
          loading={actionLoading}
        />
      )}

      <Toast toasts={toasts} remove={removeToast} />
    </DashboardLayout>
  );
}