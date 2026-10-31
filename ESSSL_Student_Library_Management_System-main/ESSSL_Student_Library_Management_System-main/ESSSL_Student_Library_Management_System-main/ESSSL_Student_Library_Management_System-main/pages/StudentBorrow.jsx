import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
import "../styles/StudentBorrow.css";

const API = "http://localhost:5000";

// ── helpers ──────────────────────────────────────────────────────────────────
const calcDaysLeft = (dueDateStr) => {
  if (!dueDateStr) return null;
  const today  = new Date(); today.setHours(0,0,0,0);
  const due    = new Date(dueDateStr); due.setHours(0,0,0,0);
  return Math.ceil((due - today) / 86400000);
};

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="sbb-toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`sbb-toast sbb-toast--${t.type}`}>
          <span className="sbb-toast-icon">
            {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}
          </span>
          <span className="sbb-toast-msg">{t.message}</span>
          <button className="sbb-toast-x" onClick={() => remove(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ── Return Confirm Modal ──────────────────────────────────────────────────────
function ReturnModal({ book, onClose, onConfirm, loading }) {
  const days = calcDaysLeft(book.due_date);
  return (
    <div className="sbb-backdrop" onClick={onClose}>
      <div className="sbb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sbb-modal-top">
          <div className="sbb-modal-icon sbb-modal-icon--return">↩️</div>
          <div>
            <h3 className="sbb-modal-title">Return Book</h3>
            <p className="sbb-modal-sub">Confirm you're returning this book</p>
          </div>
          <button className="sbb-modal-x" onClick={onClose}>✕</button>
        </div>

        <div className="sbb-modal-book-row">
          <div className="sbb-modal-thumb">
            {book.cover_image
              ? <img src={`${API}/uploads/${book.cover_image}`} alt={book.book_title} />
              : <div className="sbb-modal-thumb-ph">📗</div>}
          </div>
          <div className="sbb-modal-book-info">
            <h4>{book.book_title}</h4>
            <p>by {book.author}</p>
            <div className="sbb-modal-meta-row">
              <span>📅 Due: <strong>{fmtDate(book.due_date)}</strong></span>
              {days !== null && (
                <span style={{ color: days < 0 ? "#ef4444" : days <= 3 ? "#f59e0b" : "#22c55e" }}>
                  {days < 0 ? `⚠️ ${Math.abs(days)} days overdue` : `✓ ${days} days left`}
                </span>
              )}
            </div>
          </div>
        </div>

        {days !== null && days < 0 && (
          <div className="sbb-modal-warning">
            ⚠️ This book is <strong>{Math.abs(days)} days overdue</strong>. A fine may be applied upon return.
          </div>
        )}

        <div className="sbb-modal-footer">
          <button className="sbb-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="sbb-btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <><span className="sbb-spinner-sm" /> Returning...</> : "↩️ Confirm Return"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Renew Modal ───────────────────────────────────────────────────────────────
function RenewModal({ book, onClose, onConfirm, loading }) {
  const currentDue    = new Date(book.due_date);
  const newDue        = new Date(currentDue.getTime() + 14 * 86400000);
  const newDueStr     = newDue.toISOString().split("T")[0];

  return (
    <div className="sbb-backdrop" onClick={onClose}>
      <div className="sbb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sbb-modal-top">
          <div className="sbb-modal-icon sbb-modal-icon--renew">🔄</div>
          <div>
            <h3 className="sbb-modal-title">Renew Book</h3>
            <p className="sbb-modal-sub">Extend your borrowing period by 14 days</p>
          </div>
          <button className="sbb-modal-x" onClick={onClose}>✕</button>
        </div>

        <div className="sbb-modal-book-row">
          <div className="sbb-modal-thumb">
            {book.cover_image
              ? <img src={`${API}/uploads/${book.cover_image}`} alt={book.book_title} />
              : <div className="sbb-modal-thumb-ph">📗</div>}
          </div>
          <div className="sbb-modal-book-info">
            <h4>{book.book_title}</h4>
            <p>by {book.author}</p>
          </div>
        </div>

        <div className="sbb-modal-renew-dates">
          <div className="sbb-renew-date-card sbb-renew-date-card--old">
            <span className="sbb-renew-date-label">Current Due Date</span>
            <span className="sbb-renew-date-val">{fmtDate(book.due_date)}</span>
          </div>
          <div className="sbb-renew-arrow">→</div>
          <div className="sbb-renew-date-card sbb-renew-date-card--new">
            <span className="sbb-renew-date-label">New Due Date</span>
            <span className="sbb-renew-date-val">{fmtDate(newDueStr)}</span>
          </div>
        </div>

        <div className="sbb-modal-notice">
          ℹ️ Renewal extends your due date by <strong>14 days</strong>. Each book can be renewed up to <strong>2 times</strong>.
        </div>

        <div className="sbb-modal-footer">
          <button className="sbb-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="sbb-btn-primary" onClick={() => onConfirm(newDueStr)} disabled={loading}>
            {loading ? <><span className="sbb-spinner-sm" /> Renewing...</> : "🔄 Confirm Renewal"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Book Card ─────────────────────────────────────────────────────────────────
function BorrowCard({ book, idx, onReturn, onRenew }) {
  const days  = calcDaysLeft(book.due_date);
  const isOverdue  = days !== null && days < 0;
  const isDueSoon  = days !== null && days >= 0 && days <= 3;
  const isReturned = book.status === "Returned";

  const statusColor = isReturned ? "#22c55e"
    : isOverdue  ? "#ef4444"
    : isDueSoon  ? "#f59e0b"
    : "#6366f1";

  const statusLabel = isReturned ? "Returned"
    : isOverdue  ? `${Math.abs(days)}d overdue`
    : isDueSoon  ? `Due in ${days}d`
    : `${days}d left`;

  const statusClass = isReturned ? "returned"
    : isOverdue  ? "overdue"
    : isDueSoon  ? "due-soon"
    : "active";

  return (
    <div
      className={`sbb-card sbb-card--${statusClass}`}
      style={{ animationDelay: `${Math.min(idx * 0.06, 0.5)}s` }}
    >
      {/* Left color bar */}
      <div className="sbb-card-bar" style={{ background: statusColor }} />

      {/* Cover */}
      <div className="sbb-card-cover">
        {book.cover_image
          ? <img src={`${API}/uploads/${book.cover_image}`} alt={book.book_title} />
          : <div className="sbb-card-cover-ph">📗</div>}
      </div>

      {/* Info */}
      <div className="sbb-card-body">
        <div className="sbb-card-status-row">
          <span className={`sbb-card-status sbb-card-status--${statusClass}`}>
            {isReturned ? "✓ Returned" : isOverdue ? "⚠ Overdue" : isDueSoon ? "⏰ Due Soon" : "● Active"}
          </span>
          <span className="sbb-card-id">#{book.id}</span>
        </div>

        <h3 className="sbb-card-title">{book.book_title}</h3>
        <p className="sbb-card-author">by {book.author}</p>

        <div className="sbb-card-dates">
          <div className="sbb-card-date-item">
            <span className="sbb-card-date-label">Borrowed</span>
            <span className="sbb-card-date-val">{fmtDate(book.borrow_date)}</span>
          </div>
          <div className="sbb-card-date-sep" />
          <div className="sbb-card-date-item">
            <span className="sbb-card-date-label">Due Date</span>
            <span className="sbb-card-date-val" style={{ color: isOverdue ? "#ef4444" : "inherit" }}>
              {fmtDate(book.due_date)}
            </span>
          </div>
          {isReturned && book.return_date && (
            <>
              <div className="sbb-card-date-sep" />
              <div className="sbb-card-date-item">
                <span className="sbb-card-date-label">Returned</span>
                <span className="sbb-card-date-val" style={{ color: "#22c55e" }}>
                  {fmtDate(book.return_date)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Days left pill */}
        {!isReturned && days !== null && (
          <div className="sbb-card-days-pill" style={{ background: statusColor + "14", color: statusColor }}>
            {isOverdue
              ? `⚠️ ${Math.abs(days)} days overdue`
              : `📅 ${days} day${days !== 1 ? "s" : ""} remaining`}
          </div>
        )}
      </div>

      {/* Actions */}
      {!isReturned && (
        <div className="sbb-card-footer">
          <button className="sbb-card-btn sbb-card-btn--renew" onClick={() => onRenew(book)}>
            🔄 Renew
          </button>
          <button className="sbb-card-btn sbb-card-btn--return" onClick={() => onReturn(book)}>
            ↩️ Return
          </button>
        </div>
      )}
      {isReturned && (
        <div className="sbb-card-footer">
          <div className="sbb-card-returned-note">✓ Book returned successfully</div>
        </div>
      )}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function StudentBorrowedBooks() {
  const user   = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;

  const [books,         setBooks]         = useState([]);
  const [pageLoading,   setPageLoading]   = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter,        setFilter]        = useState("all"); // all | active | overdue | returned
  const [returnModal,   setReturnModal]   = useState(null);
  const [renewModal,    setRenewModal]    = useState(null);
  const [toasts,        setToasts]        = useState([]);

  // ── Toasts ──
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const removeToast = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  // ── Fetch ──
  const fetchBooks = useCallback(async () => {
    if (!userId) return;
    setPageLoading(true);
    try {
      const res = await axios.get(`${API}/borrowing`, { params: { user_id: userId } });
      setBooks(Array.isArray(res.data) ? res.data : []);
    } catch {
      addToast("Failed to load borrowed books.", "error");
    } finally {
      setPageLoading(false);
    }
  }, [userId, addToast]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  // ── Return ──
  const handleReturn = async () => {
    if (!returnModal) return;
    setActionLoading(true);
    try {
      const res = await axios.patch(`${API}/borrowing/${returnModal.id}/return`);
      if (res.data.success) {
        setBooks((prev) =>
          prev.map((b) =>
            b.id === returnModal.id
              ? { ...b, status: "Returned", return_date: new Date().toISOString().split("T")[0] }
              : b
          )
        );
        addToast(`"${returnModal.book_title}" returned successfully!`, "success");
        setReturnModal(null);
      } else {
        addToast(res.data.message || "Return failed.", "error");
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Return failed. Check server.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Renew ──
  const handleRenew = async (newDueDate) => {
    if (!renewModal) return;
    setActionLoading(true);
    try {
      const res = await axios.patch(`${API}/borrowing/${renewModal.id}/renew`, { new_due_date: newDueDate });
      if (res.data.success) {
        setBooks((prev) =>
          prev.map((b) =>
            b.id === renewModal.id ? { ...b, due_date: newDueDate, status: "Borrowed" } : b
          )
        );
        addToast(`"${renewModal.book_title}" renewed! New due date: ${fmtDate(newDueDate)}`, "success");
        setRenewModal(null);
      } else {
        addToast(res.data.message || "Renewal failed.", "error");
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Renewal failed. Check server.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Computed stats ──
  const activeBks   = books.filter((b) => b.status !== "Returned");
  const overdueBks  = activeBks.filter((b) => calcDaysLeft(b.due_date) < 0);
  const dueSoonBks  = activeBks.filter((b) => { const d = calcDaysLeft(b.due_date); return d >= 0 && d <= 3; });
  const returnedBks = books.filter((b) => b.status === "Returned");

  // ── Filtered list ──
  const displayed = books.filter((b) => {
    const days = calcDaysLeft(b.due_date);
    if (filter === "active")   return b.status !== "Returned" && days >= 0;
    if (filter === "overdue")  return b.status !== "Returned" && days < 0;
    if (filter === "returned") return b.status === "Returned";
    return true;
  });

  return (
    <DashboardLayout userRole="student">
      <div className="sbb-root">

        {/* ══ HERO ════════════════════════════════════════ */}
        <div className="sbb-hero">
          <div className="sbb-hero-blob sbb-hero-blob--1" />
          <div className="sbb-hero-blob sbb-hero-blob--2" />

          <div className="sbb-hero-inner">
            <div className="sbb-hero-left">
              <div className="sbb-hero-eyebrow">📚 My Library</div>
              <h1 className="sbb-hero-title">
                Borrowed <em className="sbb-hero-em">Books</em>
              </h1>
              <p className="sbb-hero-desc">
                Track your borrowings, manage renewals, and return books on time to avoid fines.
              </p>
            </div>

            {/* Stat chips */}
            <div className="sbb-hero-chips">
              {[
                { icon:"📚", num: activeBks.length,  label:"Active",   cls:"chip--blue"   },
                { icon:"⏰", num: dueSoonBks.length,  label:"Due Soon", cls:"chip--amber"  },
                { icon:"⚠️", num: overdueBks.length,  label:"Overdue",  cls:"chip--red"    },
                { icon:"✓",  num: returnedBks.length, label:"Returned", cls:"chip--green"  },
              ].map((c) => (
                <div key={c.label} className={`sbb-chip ${c.cls}`}>
                  <span className="sbb-chip-icon">{c.icon}</span>
                  <span className="sbb-chip-num">{c.num}</span>
                  <span className="sbb-chip-label">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ OVERDUE ALERT ═══════════════════════════════ */}
        {overdueBks.length > 0 && (
          <div className="sbb-alert-overdue">
            <span className="sbb-alert-icon">⚠️</span>
            <div>
              <strong>Overdue Books — Action Required</strong>
              <p>You have {overdueBks.length} overdue book{overdueBks.length > 1 ? "s" : ""}. Please return them as soon as possible to avoid additional fines.</p>
            </div>
          </div>
        )}

        {/* ══ FILTER TABS ═════════════════════════════════ */}
        <div className="sbb-tabs-wrap">
          <div className="sbb-tabs">
            {[
              { key:"all",      label:"All Books",   count: books.length       },
              { key:"active",   label:"Active",      count: activeBks.filter(b=>calcDaysLeft(b.due_date)>=0).length },
              { key:"overdue",  label:"Overdue",     count: overdueBks.length  },
              { key:"returned", label:"Returned",    count: returnedBks.length },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`sbb-tab ${filter === tab.key ? "sbb-tab--active" : ""}`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`sbb-tab-badge ${filter === tab.key ? "sbb-tab-badge--active" : ""}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ══ CONTENT ══════════════════════════════════════ */}
        <div className="sbb-content">

          {/* Loading */}
          {pageLoading && (
            <div className="sbb-loading">
              <div className="sbb-loading-spin" />
              <p>Loading your borrowed books...</p>
            </div>
          )}

          {/* Empty */}
          {!pageLoading && displayed.length === 0 && (
            <div className="sbb-empty">
              <div className="sbb-empty-icon">
                {filter === "all" ? "📭" : filter === "overdue" ? "✅" : "📚"}
              </div>
              <h3>
                {filter === "all"      ? "No borrowed books yet"
                : filter === "active"  ? "No active borrowings"
                : filter === "overdue" ? "No overdue books — great job!"
                : "No returned books yet"}
              </h3>
              <p>
                {filter === "all"
                  ? "Visit the Book Search page to borrow your first book."
                  : "Switch filter to see other records."}
              </p>
              {filter !== "all" && (
                <button className="sbb-empty-btn" onClick={() => setFilter("all")}>
                  View All Books
                </button>
              )}
            </div>
          )}

          {/* Cards grid */}
          {!pageLoading && displayed.length > 0 && (
            <div className="sbb-grid">
              {displayed.map((book, i) => (
                <BorrowCard
                  key={book.id}
                  book={book}
                  idx={i}
                  onReturn={() => setReturnModal(book)}
                  onRenew={() => setRenewModal(book)}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ══ MODALS ══ */}
      {returnModal && (
        <ReturnModal
          book={returnModal}
          onClose={() => !actionLoading && setReturnModal(null)}
          onConfirm={handleReturn}
          loading={actionLoading}
        />
      )}
      {renewModal && (
        <RenewModal
          book={renewModal}
          onClose={() => !actionLoading && setRenewModal(null)}
          onConfirm={handleRenew}
          loading={actionLoading}
        />
      )}

      <Toast toasts={toasts} remove={removeToast} />
    </DashboardLayout>
  );
}