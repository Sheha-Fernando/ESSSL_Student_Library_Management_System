import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
import "../styles/AdminBorrows.css";

const API = "http://localhost:5000";

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const isOverdue = (dueDate, status) => {
  if (status === "Returned") return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate); due.setHours(0, 0, 0, 0);
  return due < today;
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="abw-toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`abw-toast abw-toast--${t.type}`}>
          <span className="abw-toast-icon">{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
          <span className="abw-toast-msg">{t.message}</span>
          <button className="abw-toast-x" onClick={() => remove(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ borrow, onClose, onConfirm, loading }) {
  return (
    <div className="abw-backdrop" onClick={onClose}>
      <div className="abw-modal" onClick={(e) => e.stopPropagation()}>
        <div className="abw-modal-top">
          <div className="abw-modal-icon abw-modal-icon--delete">🗑️</div>
          <div>
            <h3 className="abw-modal-title">Delete Borrow Record</h3>
            <p className="abw-modal-sub">This action cannot be undone</p>
          </div>
          <button className="abw-modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="abw-modal-borrow-row">
          <div className="abw-modal-avatar">
            {borrow.student_name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="abw-modal-borrow-info">
            <h4>{borrow.student_name}</h4>
            <p>📖 {borrow.book_title}</p>
            <p className="abw-modal-date">Borrowed: {fmtDate(borrow.borrow_date)} · Due: {fmtDate(borrow.due_date)}</p>
          </div>
        </div>
        <div className="abw-modal-warning">
          ⚠️ Deleting this record will permanently remove it. Book availability will not be adjusted automatically.
        </div>
        <div className="abw-modal-footer">
          <button className="abw-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="abw-btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <><span className="abw-spinner-sm" /> Deleting...</> : "🗑️ Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Return Confirm Modal ──────────────────────────────────────────────────────
function ReturnModal({ borrow, onClose, onConfirm, loading }) {
  return (
    <div className="abw-backdrop" onClick={onClose}>
      <div className="abw-modal" onClick={(e) => e.stopPropagation()}>
        <div className="abw-modal-top">
          <div className="abw-modal-icon abw-modal-icon--return">✅</div>
          <div>
            <h3 className="abw-modal-title">Mark as Returned</h3>
            <p className="abw-modal-sub">Confirm book has been returned</p>
          </div>
          <button className="abw-modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="abw-modal-borrow-row">
          <div className="abw-modal-avatar">
            {borrow.student_name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="abw-modal-borrow-info">
            <h4>{borrow.student_name}</h4>
            <p>📖 {borrow.book_title}</p>
            <p className="abw-modal-date">Due: {fmtDate(borrow.due_date)}</p>
          </div>
        </div>
        <div className="abw-modal-footer">
          <button className="abw-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="abw-btn-success" onClick={onConfirm} disabled={loading}>
            {loading ? <><span className="abw-spinner-sm" /> Processing...</> : "✅ Confirm Return"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Renew Modal ───────────────────────────────────────────────────────────────
function RenewModal({ borrow, onClose, onConfirm, loading }) {
  const defaultDate = (() => {
    const d = new Date(borrow.due_date);
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  })();
  const [newDate, setNewDate] = useState(defaultDate);
  const renewalsLeft = 2 - (borrow.renewal_count || 0);

  return (
    <div className="abw-backdrop" onClick={onClose}>
      <div className="abw-modal" onClick={(e) => e.stopPropagation()}>
        <div className="abw-modal-top">
          <div className="abw-modal-icon abw-modal-icon--renew">🔄</div>
          <div>
            <h3 className="abw-modal-title">Renew Borrowing</h3>
            <p className="abw-modal-sub">{renewalsLeft} renewal{renewalsLeft !== 1 ? "s" : ""} remaining</p>
          </div>
          <button className="abw-modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="abw-modal-borrow-row">
          <div className="abw-modal-avatar">
            {borrow.student_name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="abw-modal-borrow-info">
            <h4>{borrow.student_name}</h4>
            <p>📖 {borrow.book_title}</p>
            <p className="abw-modal-date">Current due: {fmtDate(borrow.due_date)}</p>
          </div>
        </div>
        <div className="abw-renew-date-row">
          <label className="abw-renew-label">New Due Date</label>
          <input
            className="abw-renew-input"
            type="date"
            value={newDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setNewDate(e.target.value)}
          />
        </div>
        <div className="abw-modal-footer">
          <button className="abw-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="abw-btn-renew" onClick={() => onConfirm(newDate)} disabled={loading}>
            {loading ? <><span className="abw-spinner-sm" /> Renewing...</> : "🔄 Confirm Renewal"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Borrow Drawer ─────────────────────────────────────────────────────────
function AddBorrowDrawer({ students, books, onSave, onClose, loading }) {
  const [form, setForm] = useState({ user_id: "", book_id: "", due_date: "" });
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const availableBooks = books.filter((b) => b.available_copies > 0);

  return (
    <div className="abw-drawer-backdrop" onClick={onClose}>
      <div className="abw-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="abw-drawer-header">
          <div className="abw-drawer-icon">📤</div>
          <div>
            <h2 className="abw-drawer-title">Issue Book</h2>
            <p className="abw-drawer-sub">Register a new borrowing transaction</p>
          </div>
          <button className="abw-drawer-close" onClick={onClose}>✕</button>
        </div>

        <div className="abw-drawer-body">
          <div className="abw-form-stack">
            <div className="abw-field">
              <label className="abw-label">Student <span className="abw-req">*</span></label>
              <select className="abw-input" name="user_id" value={form.user_id} onChange={handleChange}>
                <option value="">Select a student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                ))}
              </select>
            </div>
            <div className="abw-field">
              <label className="abw-label">Book <span className="abw-req">*</span></label>
              <select className="abw-input" name="book_id" value={form.book_id} onChange={handleChange}>
                <option value="">Select a book</option>
                {availableBooks.map((b) => (
                  <option key={b.id} value={b.id}>{b.title} — {b.author} ({b.available_copies} left)</option>
                ))}
              </select>
              {books.length > 0 && availableBooks.length === 0 && (
                <p className="abw-field-hint abw-field-hint--red">⚠ No books currently available</p>
              )}
            </div>
            <div className="abw-field">
              <label className="abw-label">Due Date <span className="abw-req">*</span></label>
              <input
                className="abw-input"
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
        </div>

        <div className="abw-drawer-footer">
          <button className="abw-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="abw-btn-primary" onClick={() => onSave(form)} disabled={loading}>
            {loading ? <><span className="abw-spinner-sm" /> Issuing...</> : "📤 Issue Book"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Borrow Row ────────────────────────────────────────────────────────────────
function BorrowRow({ borrow: b, idx, onReturn, onRenew, onDelete }) {
  const overdue = isOverdue(b.due_date, b.status);
  const isReturned = b.status === "Returned";

  const avatarColors = [
    "linear-gradient(135deg,#6366f1,#8b5cf6)",
    "linear-gradient(135deg,#3b82f6,#2563eb)",
    "linear-gradient(135deg,#10b981,#059669)",
    "linear-gradient(135deg,#f59e0b,#d97706)",
    "linear-gradient(135deg,#ef4444,#dc2626)",
    "linear-gradient(135deg,#8b5cf6,#7c3aed)",
  ];
  const color = avatarColors[b.id % avatarColors.length];
  const initials = b.student_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className="abw-borrow-row" style={{ animationDelay: `${Math.min(idx * 0.04, 0.4)}s` }}>
      {/* Book cover thumbnail */}
      <div className="abw-book-thumb">
        {b.cover_image
          ? <img src={`${API}/uploads/${b.cover_image}`} alt={b.book_title} />
          : <div className="abw-book-thumb-ph">📗</div>}
      </div>

      <div className="abw-borrow-info">
        <div className="abw-borrow-title-row">
          <h3 className="abw-borrow-book">{b.book_title}</h3>
          <span className={`abw-status-badge ${isReturned ? "returned" : overdue ? "overdue" : "active"}`}>
            {isReturned ? "✓ Returned" : overdue ? "⚠ Overdue" : "● Active"}
          </span>
          {!isReturned && (b.renewal_count || 0) > 0 && (
            <span className="abw-renewal-badge">🔄 Renewed ×{b.renewal_count}</span>
          )}
        </div>
        <p className="abw-borrow-author">by {b.author}</p>
        <div className="abw-borrow-student-row">
          <div className="abw-student-mini-avatar" style={{ background: color }}>{initials}</div>
          <span className="abw-borrow-student">{b.student_name}</span>
        </div>
        <div className="abw-borrow-meta">
          <span className="abw-borrow-tag">📅 Borrowed: {fmtDate(b.borrow_date)}</span>
          <span className={`abw-borrow-tag ${overdue ? "tag--red" : ""}`}>
            🕒 Due: {fmtDate(b.due_date)}
          </span>
          {isReturned && b.return_date && (
            <span className="abw-borrow-tag tag--green">✓ Returned: {fmtDate(b.return_date)}</span>
          )}
          <span className="abw-borrow-tag">ID: #{b.id}</span>
        </div>
      </div>

      <div className="abw-borrow-actions">
        {!isReturned && (
          <>
            <button className="abw-row-btn abw-row-btn--return" onClick={() => onReturn(b)}>✅ Return</button>
            <button
              className="abw-row-btn abw-row-btn--renew"
              onClick={() => onRenew(b)}
              disabled={(b.renewal_count || 0) >= 2}
              title={(b.renewal_count || 0) >= 2 ? "Max renewals reached" : "Renew for 14 more days"}
            >
              🔄 Renew
            </button>
          </>
        )}
        <button className="abw-row-btn abw-row-btn--delete" onClick={() => onDelete(b)}>🗑️</button>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function AdminBorrows() {
  const [borrows, setBorrows] = useState([]);
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDrawer, setShowDrawer] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [returnModal, setReturnModal] = useState(null);
  const [renewModal, setRenewModal] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const removeToast = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  const fetchBorrows = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/borrowing`);
      setBorrows(Array.isArray(res.data) ? res.data : []);
    } catch {
      addToast("Failed to load borrowing records.", "error");
    } finally {
      setPageLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [bRes, sRes, bkRes] = await Promise.all([
          axios.get(`${API}/borrowing`),
          axios.get(`${API}/users`, { params: { role: "student" } }),
          axios.get(`${API}/books`),
        ]);
        setBorrows(Array.isArray(bRes.data) ? bRes.data : []);
        setStudents(Array.isArray(sRes.data) ? sRes.data : []);
        setBooks(Array.isArray(bkRes.data) ? bkRes.data : []);
      } catch {
        addToast("Failed to load data.", "error");
      } finally {
        setPageLoading(false);
      }
    };
    loadAll();
  }, [addToast]);

  const handleAddBorrow = async (form) => {
    if (!form.user_id || !form.book_id || !form.due_date) {
      addToast("Please fill in all required fields.", "error");
      return;
    }
    setActionLoading(true);
    try {
      await axios.post(`${API}/borrowing`, {
        user_id: form.user_id,
        book_id: form.book_id,
        due_date: form.due_date,
      });
      addToast("Book issued successfully!", "success");
      setShowDrawer(false);
      fetchBorrows();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to issue book.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!returnModal) return;
    setActionLoading(true);
    try {
      await axios.patch(`${API}/borrowing/${returnModal.id}/return`);
      setBorrows((p) => p.map((b) => b.id === returnModal.id
        ? { ...b, status: "Returned", return_date: new Date().toISOString() }
        : b
      ));
      addToast(`"${returnModal.book_title}" marked as returned.`, "success");
      setReturnModal(null);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to mark as returned.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenew = async (newDueDate) => {
    if (!renewModal) return;
    setActionLoading(true);
    try {
      const res = await axios.patch(`${API}/borrowing/${renewModal.id}/renew`, { new_due_date: newDueDate });
      setBorrows((p) => p.map((b) => b.id === renewModal.id
        ? { ...b, due_date: res.data.new_due_date, renewal_count: (b.renewal_count || 0) + 1 }
        : b
      ));
      addToast(`Renewed until ${fmtDate(res.data.new_due_date)}.`, "success");
      setRenewModal(null);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to renew.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setActionLoading(true);
    try {
      await axios.delete(`${API}/borrowing/${deleteModal.id}`);
      setBorrows((p) => p.filter((b) => b.id !== deleteModal.id));
      addToast("Borrow record deleted.", "info");
      setDeleteModal(null);
    } catch {
      addToast("Failed to delete record.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered list
  const displayed = borrows.filter((b) => {
    const over = isOverdue(b.due_date, b.status);
    const matchSearch = [b.student_name, b.book_title, b.author, b.status]
      .join(" ").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active"   && b.status !== "Returned" && !over) ||
      (filterStatus === "overdue"  && over) ||
      (filterStatus === "returned" && b.status === "Returned");
    return matchSearch && matchStatus;
  });

  // Metrics
  const activeCount   = borrows.filter((b) => b.status !== "Returned").length;
  const overdueCount  = borrows.filter((b) => isOverdue(b.due_date, b.status)).length;
  const returnedCount = borrows.filter((b) => b.status === "Returned").length;

  return (
    <DashboardLayout userRole="admin">
      <div className="abw-root">

        {/* ══ HERO ════════════════════════════════════════ */}
        <div className="abw-hero">
          <div className="abw-hero-blob abw-hero-blob--1" />
          <div className="abw-hero-blob abw-hero-blob--2" />
          <div className="abw-hero-blob abw-hero-blob--3" />
          <div className="abw-hero-inner">
            <div className="abw-hero-left">
              <div className="abw-hero-eyebrow">🔄 Admin Panel</div>
              <h1 className="abw-hero-title">
                Borrowing <em className="abw-hero-em">Management</em>
              </h1>
              <p className="abw-hero-desc">
                Issue books, track active loans, process returns, and manage renewals — all in one place.
              </p>
            </div>
            <div className="abw-hero-chips">
              {[
                { icon: "📋", num: borrows.length,  label: "Total Records", cls: "chip--blue"   },
                { icon: "🔄", num: activeCount,      label: "Active",        cls: "chip--indigo" },
                { icon: "⚠️", num: overdueCount,     label: "Overdue",       cls: "chip--red"    },
                { icon: "✓",  num: returnedCount,    label: "Returned",      cls: "chip--green"  },
              ].map((c) => (
                <div key={c.label} className={`abw-chip ${c.cls}`}>
                  <span className="abw-chip-icon">{c.icon}</span>
                  <span className="abw-chip-num">{c.num}</span>
                  <span className="abw-chip-label">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ OVERDUE ALERT ══════════════════════════════ */}
        {!pageLoading && overdueCount > 0 && (
          <div className="abw-alert-overdue">
            <span className="abw-alert-icon">⚠️</span>
            <div>
              <strong>Overdue Books Need Attention</strong>
              <p>{overdueCount} book{overdueCount > 1 ? "s are" : " is"} past the due date and may require a fine.</p>
            </div>
            <button className="abw-alert-action" onClick={() => setFilterStatus("overdue")}>
              View Overdue →
            </button>
          </div>
        )}

        {/* ══ TOOLBAR ═════════════════════════════════════ */}
        <div className="abw-toolbar">
          <div className="abw-toolbar-left">
            <div className="abw-search-wrap">
              <span className="abw-search-icon">🔍</span>
              <input
                className="abw-search"
                type="text"
                placeholder="Search student, book, author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && <button className="abw-search-clear" onClick={() => setSearch("")}>✕</button>}
            </div>
            <select className="abw-filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Records</option>
              <option value="active">Active</option>
              <option value="overdue">Overdue</option>
              <option value="returned">Returned</option>
            </select>
          </div>
          <button className="abw-add-btn" onClick={() => setShowDrawer(true)}>
            📤 Issue Book
          </button>
        </div>

        {/* ══ RESULTS INFO ════════════════════════════════ */}
        {!pageLoading && (
          <div className="abw-results-info">
            Showing <strong>{displayed.length}</strong> of <strong>{borrows.length}</strong> records
            {(search || filterStatus !== "all") && (
              <button className="abw-clear-filters" onClick={() => { setSearch(""); setFilterStatus("all"); }}>
                Clear filters ✕
              </button>
            )}
          </div>
        )}

        {/* ══ CONTENT ══════════════════════════════════════ */}
        <div className="abw-content">
          {pageLoading ? (
            <div className="abw-loading">
              <div className="abw-loading-spin" />
              <p>Loading borrowing records...</p>
            </div>
          ) : displayed.length === 0 ? (
            <div className="abw-empty">
              <div className="abw-empty-icon">{borrows.length === 0 ? "📚" : "🔍"}</div>
              <h3>{borrows.length === 0 ? "No borrowing records yet" : "No records match your search"}</h3>
              <p>{borrows.length === 0 ? "Issue the first book to get started." : "Try adjusting your search or filters."}</p>
              {borrows.length === 0 ? (
                <button className="abw-empty-btn" onClick={() => setShowDrawer(true)}>📤 Issue First Book</button>
              ) : (
                <button className="abw-empty-btn" onClick={() => { setSearch(""); setFilterStatus("all"); }}>Clear Filters</button>
              )}
            </div>
          ) : (
            <div className="abw-borrow-list">
              {displayed.map((b, i) => (
                <BorrowRow
                  key={b.id}
                  borrow={b}
                  idx={i}
                  onReturn={(r) => setReturnModal(r)}
                  onRenew={(r) => setRenewModal(r)}
                  onDelete={(r) => setDeleteModal(r)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ DRAWERS & MODALS ══ */}
      {showDrawer && (
        <AddBorrowDrawer
          students={students}
          books={books}
          onSave={handleAddBorrow}
          onClose={() => { if (!actionLoading) setShowDrawer(false); }}
          loading={actionLoading}
        />
      )}
      {returnModal && (
        <ReturnModal
          borrow={returnModal}
          onClose={() => !actionLoading && setReturnModal(null)}
          onConfirm={handleReturn}
          loading={actionLoading}
        />
      )}
      {renewModal && (
        <RenewModal
          borrow={renewModal}
          onClose={() => !actionLoading && setRenewModal(null)}
          onConfirm={handleRenew}
          loading={actionLoading}
        />
      )}
      {deleteModal && (
        <DeleteModal
          borrow={deleteModal}
          onClose={() => !actionLoading && setDeleteModal(null)}
          onConfirm={handleDelete}
          loading={actionLoading}
        />
      )}

      <Toast toasts={toasts} remove={removeToast} />
    </DashboardLayout>
  );
}