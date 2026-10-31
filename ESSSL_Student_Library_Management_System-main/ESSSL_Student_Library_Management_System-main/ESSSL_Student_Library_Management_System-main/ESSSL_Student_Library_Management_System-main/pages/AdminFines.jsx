import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
import "../styles/AdminFines.css";

const API = "http://localhost:5000";

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtAmount = (amt) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amt || 0);

const STATUS_META = {
  pending: { cls: "pending", label: "⏳ Pending", color: "amber" },
  paid:    { cls: "paid",    label: "✅ Paid",    color: "green" },
  waived:  { cls: "waived",  label: "🔖 Waived",  color: "blue"  },
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="afm-toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`afm-toast afm-toast--${t.type}`}>
          <span className="afm-toast-icon">{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
          <span className="afm-toast-msg">{t.message}</span>
          <button className="afm-toast-x" onClick={() => remove(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ fine, onClose, onConfirm, loading }) {
  return (
    <div className="afm-backdrop" onClick={onClose}>
      <div className="afm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="afm-modal-top">
          <div className="afm-modal-icon afm-modal-icon--delete">🗑️</div>
          <div>
            <h3 className="afm-modal-title">Delete Fine</h3>
            <p className="afm-modal-sub">This action cannot be undone</p>
          </div>
          <button className="afm-modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="afm-modal-res-row">
          <div className="afm-modal-avatar">
            {fine.student?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="afm-modal-res-info">
            <h4>{fine.student}</h4>
            <p>📖 {fine.book_title || "—"}</p>
            <p className="afm-modal-date">Amount: {fmtAmount(fine.amount)} · {fine.reason}</p>
          </div>
        </div>
        <div className="afm-modal-warning">
          ⚠️ Deleting this fine will permanently remove it from the system.
        </div>
        <div className="afm-modal-footer">
          <button className="afm-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="afm-btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <><span className="afm-spinner-sm" /> Deleting...</> : "🗑️ Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Action Modal (Pay / Waive) ────────────────────────────────────────────────
function ActionModal({ fine, onClose, onPay, onWaive, loading }) {
  return (
    <div className="afm-backdrop" onClick={onClose}>
      <div className="afm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="afm-modal-top">
          <div className="afm-modal-icon afm-modal-icon--status">💰</div>
          <div>
            <h3 className="afm-modal-title">Manage Fine</h3>
            <p className="afm-modal-sub">{fine.student} · {fine.book_title || "—"}</p>
          </div>
          <button className="afm-modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="afm-modal-res-row">
          <div className="afm-modal-avatar">
            {fine.student?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="afm-modal-res-info">
            <h4>{fmtAmount(fine.amount)}</h4>
            <p>📋 {fine.reason}</p>
            {fine.days_overdue > 0 && (
              <p className="afm-modal-date">⏱ {fine.days_overdue} day{fine.days_overdue !== 1 ? "s" : ""} overdue</p>
            )}
          </div>
        </div>
        <div className="afm-action-options">
          <button
            className={`afm-action-opt afm-action-opt--green ${fine.status === "paid" ? "disabled" : ""}`}
            onClick={onPay}
            disabled={loading || fine.status === "paid"}
          >
            <span className="afm-action-opt-icon">✅</span>
            <span className="afm-action-opt-label">Mark as Paid</span>
            <span className="afm-action-opt-desc">Student has paid this fine</span>
          </button>
          <button
            className={`afm-action-opt afm-action-opt--blue ${fine.status === "waived" ? "disabled" : ""}`}
            onClick={onWaive}
            disabled={loading || fine.status === "waived"}
          >
            <span className="afm-action-opt-icon">🔖</span>
            <span className="afm-action-opt-label">Waive Fine</span>
            <span className="afm-action-opt-desc">Forgive this fine for the student</span>
          </button>
        </div>
        <div className="afm-modal-footer">
          <button className="afm-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Add Fine Drawer ───────────────────────────────────────────────────────────
function AddDrawer({ students, borrowings, onSave, onClose, loading }) {
  const [form, setForm] = useState({
    user_id: "",
    borrowing_id: "",
    amount: "",
    reason: "",
    days_overdue: "",
  });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Filter borrowings for selected student
  const studentBorrowings = borrowings.filter(
    (b) => !form.user_id || String(b.user_id) === String(form.user_id)
  );

  return (
    <div className="afm-drawer-backdrop" onClick={onClose}>
      <div className="afm-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="afm-drawer-header">
          <div className="afm-drawer-icon">💰</div>
          <div>
            <h2 className="afm-drawer-title">Add Fine</h2>
            <p className="afm-drawer-sub">Create a new fine for a student</p>
          </div>
          <button className="afm-drawer-close" onClick={onClose}>✕</button>
        </div>

        <div className="afm-drawer-body">
          <div className="afm-form-stack">
            <div className="afm-field">
              <label className="afm-label">Student <span className="afm-req">*</span></label>
              <select className="afm-input" name="user_id" value={form.user_id} onChange={handleChange}>
                <option value="">Select a student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                ))}
              </select>
            </div>
            <div className="afm-field">
              <label className="afm-label">Borrowing Record (Optional)</label>
              <select className="afm-input" name="borrowing_id" value={form.borrowing_id} onChange={handleChange}>
                <option value="">No linked borrowing</option>
                {studentBorrowings.map((b) => (
                  <option key={b.id} value={b.id}>
                    #{b.id} — {b.book_title} ({b.status})
                  </option>
                ))}
              </select>
            </div>
            <div className="afm-field">
              <label className="afm-label">Amount (USD) <span className="afm-req">*</span></label>
              <input
                className="afm-input"
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="e.g. 5.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="afm-field">
              <label className="afm-label">Reason <span className="afm-req">*</span></label>
              <select className="afm-input" name="reason" value={form.reason} onChange={handleChange}>
                <option value="">Select a reason</option>
                <option value="Overdue return">Overdue return</option>
                <option value="Lost book">Lost book</option>
                <option value="Damaged book">Damaged book</option>
                <option value="Late reservation pickup">Late reservation pickup</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="afm-field">
              <label className="afm-label">Days Overdue</label>
              <input
                className="afm-input"
                type="number"
                name="days_overdue"
                value={form.days_overdue}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="afm-drawer-footer">
          <button className="afm-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="afm-btn-primary" onClick={() => onSave(form)} disabled={loading}>
            {loading ? <><span className="afm-spinner-sm" /> Adding...</> : "💰 Add Fine"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Fine Row ──────────────────────────────────────────────────────────────────
function FineRow({ fine: f, idx, onAction, onDelete }) {
  const meta = STATUS_META[f.status] || STATUS_META.pending;

  const avatarColors = [
    "linear-gradient(135deg,#6366f1,#8b5cf6)",
    "linear-gradient(135deg,#3b82f6,#2563eb)",
    "linear-gradient(135deg,#10b981,#059669)",
    "linear-gradient(135deg,#f59e0b,#d97706)",
    "linear-gradient(135deg,#ef4444,#dc2626)",
    "linear-gradient(135deg,#8b5cf6,#7c3aed)",
  ];
  const color = avatarColors[f.id % avatarColors.length];
  const initials = f.student?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className="afm-res-row" style={{ animationDelay: `${Math.min(idx * 0.04, 0.4)}s` }}>
      <div className="afm-res-avatar" style={{ background: color }}>{initials}</div>

      <div className="afm-res-info">
        <div className="afm-res-name-row">
          <h3 className="afm-res-name">{f.student}</h3>
          <span className={`afm-status-badge afm-status-badge--${meta.color}`}>{meta.label}</span>
          {f.status === "pending" && f.days_overdue > 0 && (
            <span className="afm-overdue-badge">⚠ {f.days_overdue}d overdue</span>
          )}
        </div>
        <p className="afm-res-book">📖 {f.book_title || "No linked book"}</p>
        <div className="afm-res-meta">
          <span className="afm-res-tag afm-res-tag--amount">💵 {fmtAmount(f.amount)}</span>
          <span className="afm-res-tag">📋 {f.reason}</span>
          <span className="afm-res-tag">📅 Issued: {fmtDate(f.created_at)}</span>
          {f.payment_date && (
            <span className="afm-res-tag afm-res-tag--paid">✅ {fmtDate(f.payment_date)}</span>
          )}
          <span className="afm-res-tag">ID: #{f.id}</span>
        </div>
      </div>

      <div className="afm-res-actions">
        {f.status === "pending" && (
          <button className="afm-row-btn afm-row-btn--action" onClick={() => onAction(f)}>
            💰 Manage
          </button>
        )}
        <button className="afm-row-btn afm-row-btn--delete" onClick={() => onDelete(f)}>
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function AdminFines() {
  const [fines, setFines] = useState([]);
  const [students, setStudents] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDrawer, setShowDrawer] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const removeToast = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  const fetchFines = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/fines`);
      setFines(Array.isArray(res.data) ? res.data : []);
    } catch {
      addToast("Failed to load fines.", "error");
    }
  }, [addToast]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [finesRes, studsRes, borrowRes] = await Promise.all([
          axios.get(`${API}/fines`),
          axios.get(`${API}/users`, { params: { role: "student" } }),
          axios.get(`${API}/borrowing`),
        ]);
        setFines(Array.isArray(finesRes.data) ? finesRes.data : []);
        setStudents(Array.isArray(studsRes.data) ? studsRes.data : []);
        setBorrowings(Array.isArray(borrowRes.data) ? borrowRes.data : []);
      } catch {
        addToast("Failed to load data.", "error");
      } finally {
        setPageLoading(false);
      }
    };
    fetchAll();
  }, [addToast]);

  const handleAdd = async (form) => {
    if (!form.user_id || !form.amount || !form.reason) {
      addToast("Please fill in all required fields.", "error");
      return;
    }
    setActionLoading(true);
    try {
      await axios.post(`${API}/fines`, {
        user_id: form.user_id,
        borrowing_id: form.borrowing_id || null,
        amount: parseFloat(form.amount),
        reason: form.reason,
        days_overdue: parseInt(form.days_overdue) || 0,
      });
      addToast("Fine added successfully!", "success");
      setShowDrawer(false);
      await fetchFines();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to add fine.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePay = async () => {
    if (!actionModal) return;
    setActionLoading(true);
    try {
      await axios.patch(`${API}/fines/${actionModal.id}/pay`);
      setFines((p) =>
        p.map((f) =>
          f.id === actionModal.id
            ? { ...f, status: "paid", payment_date: new Date().toISOString() }
            : f
        )
      );
      addToast("Fine marked as paid.", "success");
      setActionModal(null);
    } catch {
      addToast("Failed to mark fine as paid.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWaive = async () => {
    if (!actionModal) return;
    setActionLoading(true);
    try {
      await axios.patch(`${API}/fines/${actionModal.id}/waive`);
      setFines((p) =>
        p.map((f) =>
          f.id === actionModal.id ? { ...f, status: "waived", payment_date: null } : f
        )
      );
      addToast("Fine has been waived.", "info");
      setActionModal(null);
    } catch {
      addToast("Failed to waive fine.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setActionLoading(true);
    try {
      await axios.delete(`${API}/fines/${deleteModal.id}`);
      setFines((p) => p.filter((f) => f.id !== deleteModal.id));
      addToast("Fine deleted.", "info");
      setDeleteModal(null);
    } catch {
      addToast("Failed to delete fine.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered list
  const displayed = fines.filter((f) => {
    const matchSearch = [f.student, f.book_title, f.reason, f.status]
      .join(" ").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || f.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Metrics
  const pending  = fines.filter((f) => f.status === "pending").length;
  const paid     = fines.filter((f) => f.status === "paid").length;
  const waived   = fines.filter((f) => f.status === "waived").length;
  const totalOwed = fines
    .filter((f) => f.status === "pending")
    .reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);

  return (
    <DashboardLayout userRole="admin">
      <div className="afm-root">

        {/* ══ HERO ════════════════════════════════════════ */}
        <div className="afm-hero">
          <div className="afm-hero-blob afm-hero-blob--1" />
          <div className="afm-hero-blob afm-hero-blob--2" />
          <div className="afm-hero-blob afm-hero-blob--3" />
          <div className="afm-hero-inner">
            <div className="afm-hero-left">
              <div className="afm-hero-eyebrow">💰 Admin Panel</div>
              <h1 className="afm-hero-title">
                Fine <em className="afm-hero-em">Management</em>
              </h1>
              <p className="afm-hero-desc">
                Track and manage student fines. Mark payments, waive fines, and monitor outstanding balances in real time.
              </p>
            </div>
            <div className="afm-hero-chips">
              {[
                { icon: "💰", num: fines.length,      label: "Total",     cls: "chip--blue"   },
                { icon: "⏳", num: pending,            label: "Pending",   cls: "chip--amber"  },
                { icon: "✅", num: paid,               label: "Paid",      cls: "chip--green"  },
                { icon: "🔖", num: waived,             label: "Waived",    cls: "chip--purple" },
              ].map((c) => (
                <div key={c.label} className={`afm-chip ${c.cls}`}>
                  <span className="afm-chip-icon">{c.icon}</span>
                  <span className="afm-chip-num">{c.num}</span>
                  <span className="afm-chip-label">{c.label}</span>
                </div>
              ))}
              <div className="afm-chip chip--red">
                <span className="afm-chip-icon">💵</span>
                <span className="afm-chip-num">{fmtAmount(totalOwed)}</span>
                <span className="afm-chip-label">Outstanding</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══ TOOLBAR ═════════════════════════════════════ */}
        <div className="afm-toolbar">
          <div className="afm-toolbar-left">
            <div className="afm-search-wrap">
              <span className="afm-search-icon">🔍</span>
              <input
                className="afm-search"
                type="text"
                placeholder="Search student, book, reason, or status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && <button className="afm-search-clear" onClick={() => setSearch("")}>✕</button>}
            </div>
            <select className="afm-filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="waived">Waived</option>
            </select>
          </div>
          <button className="afm-add-btn" onClick={() => setShowDrawer(true)}>
            ➕ Add Fine
          </button>
        </div>

        {/* ══ RESULTS INFO ════════════════════════════════ */}
        {!pageLoading && (
          <div className="afm-results-info">
            Showing <strong>{displayed.length}</strong> of <strong>{fines.length}</strong> fines
            {(search || filterStatus !== "all") && (
              <button className="afm-clear-filters" onClick={() => { setSearch(""); setFilterStatus("all"); }}>
                Clear filters ✕
              </button>
            )}
          </div>
        )}

        {/* ══ CONTENT ══════════════════════════════════════ */}
        <div className="afm-content">
          {pageLoading ? (
            <div className="afm-loading">
              <div className="afm-loading-spin" />
              <p>Loading fines...</p>
            </div>
          ) : displayed.length === 0 ? (
            <div className="afm-empty">
              <div className="afm-empty-icon">{fines.length === 0 ? "💰" : "🔍"}</div>
              <h3>{fines.length === 0 ? "No fines yet" : "No fines match your search"}</h3>
              <p>{fines.length === 0 ? "Create the first fine for a student." : "Try adjusting your search or filters."}</p>
              {fines.length === 0 ? (
                <button className="afm-empty-btn" onClick={() => setShowDrawer(true)}>➕ Add First Fine</button>
              ) : (
                <button className="afm-empty-btn" onClick={() => { setSearch(""); setFilterStatus("all"); }}>Clear Filters</button>
              )}
            </div>
          ) : (
            <div className="afm-res-list">
              {displayed.map((f, i) => (
                <FineRow
                  key={f.id}
                  fine={f}
                  idx={i}
                  onAction={(fine) => setActionModal(fine)}
                  onDelete={(fine) => setDeleteModal(fine)}
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
          borrowings={borrowings}
          onSave={handleAdd}
          onClose={() => { if (!actionLoading) setShowDrawer(false); }}
          loading={actionLoading}
        />
      )}

      {/* ══ ACTION MODAL ══ */}
      {actionModal && (
        <ActionModal
          fine={actionModal}
          onClose={() => !actionLoading && setActionModal(null)}
          onPay={handlePay}
          onWaive={handleWaive}
          loading={actionLoading}
        />
      )}

      {/* ══ DELETE MODAL ══ */}
      {deleteModal && (
        <DeleteModal
          fine={deleteModal}
          onClose={() => !actionLoading && setDeleteModal(null)}
          onConfirm={handleDelete}
          loading={actionLoading}
        />
      )}

      <Toast toasts={toasts} remove={removeToast} />
    </DashboardLayout>
  );
}