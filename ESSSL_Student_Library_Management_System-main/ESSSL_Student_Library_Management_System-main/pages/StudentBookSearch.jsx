import React, { useEffect, useState, useMemo, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/StudentBookSearch.css";

const API = "http://localhost:5000";

const CATEGORIES = [
  "Fiction","Dystopian","Self-Help","Fantasy","Romance",
  "Memoir","Non-Fiction","Science","History","Technology","Biography","Mystery",
];

const CATEGORY_COLORS = {
  Fiction:"#6366f1", Dystopian:"#ef4444", "Self-Help":"#22c55e",
  Fantasy:"#8b5cf6", Romance:"#ec4899", Memoir:"#f59e0b",
  "Non-Fiction":"#14b8a6", Science:"#0ea5e9", History:"#92400e",
  Technology:"#06b6d4", Biography:"#f97316", Mystery:"#7c3aed",
};

const getCatColor = (cat) => CATEGORY_COLORS[cat] || "#6366f1";

// ─── Toast Notification ───────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="sbs-toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`sbs-toast sbs-toast--${t.type}`}>
          <span className="sbs-toast-icon">{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
          <span className="sbs-toast-msg">{t.message}</span>
          <button className="sbs-toast-close" onClick={() => remove(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ─── Borrow Modal ─────────────────────────────────────────────────────────────
function BorrowModal({ book, onClose, onConfirm, loading }) {
  const today     = new Date();
  const defaultDue = new Date(today.getTime() + 14 * 86400000).toISOString().split("T")[0];
  const [dueDate, setDueDate] = useState(defaultDue);
  const color = getCatColor(book.category);

  return (
    <div className="sbs-backdrop" onClick={onClose}>
      <div className="sbs-modal" onClick={(e) => e.stopPropagation()}>

        <div className="sbs-modal-header">
          <div className="sbs-modal-icon" style={{ background: `linear-gradient(135deg,${color},${color}bb)` }}>📖</div>
          <div className="sbs-modal-header-text">
            <h3>Borrow Book</h3>
            <p>Confirm your borrowing request</p>
          </div>
          <button className="sbs-modal-x" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="sbs-modal-book">
          <div className="sbs-modal-thumb">
            {book.cover_image
              ? <img src={`${API}/uploads/${book.cover_image}`} alt={book.title} />
              : <div className="sbs-modal-thumb-ph" style={{ background: color + "22" }}>📗</div>}
          </div>
          <div className="sbs-modal-book-info">
            <h4 className="sbs-modal-book-title">{book.title}</h4>
            <p className="sbs-modal-book-author">by {book.author}</p>
            <span className="sbs-modal-cat-badge" style={{ background: color + "18", color }}>
              {book.category}
            </span>
          </div>
        </div>

        <div className="sbs-modal-field">
          <label htmlFor="due-date">📅 Return Due Date</label>
          <input
            id="due-date"
            type="date"
            className="sbs-modal-input"
            value={dueDate}
            min={today.toISOString().split("T")[0]}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="sbs-modal-info-row">
          <div className="sbs-modal-info-item">
            <span className="sbs-modal-info-label">Borrow Date</span>
            <span className="sbs-modal-info-val">{today.toLocaleDateString("en-GB", { day:"numeric",month:"short",year:"numeric" })}</span>
          </div>
          <div className="sbs-modal-info-item">
            <span className="sbs-modal-info-label">Copies Available</span>
            <span className="sbs-modal-info-val" style={{ color: "#22c55e", fontWeight: 700 }}>{book.available_copies}</span>
          </div>
          <div className="sbs-modal-info-item">
            <span className="sbs-modal-info-label">Borrow Period</span>
            <span className="sbs-modal-info-val">14 days</span>
          </div>
        </div>

        <div className="sbs-modal-footer">
          <button className="sbs-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button
            className="sbs-btn-primary"
            style={{ background: `linear-gradient(135deg,${color},${color}bb)` }}
            onClick={() => onConfirm(dueDate)}
            disabled={loading || !dueDate}
          >
            {loading ? <><span className="sbs-btn-spinner" /> Processing...</> : "✅ Confirm Borrow"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reserve Modal ────────────────────────────────────────────────────────────
function ReserveModal({ book, onClose, onConfirm, loading }) {
  const today       = new Date();
  const defaultDead = new Date(today.getTime() + 7 * 86400000).toISOString().split("T")[0];
  const [deadline, setDeadline] = useState(defaultDead);

  return (
    <div className="sbs-backdrop" onClick={onClose}>
      <div className="sbs-modal" onClick={(e) => e.stopPropagation()}>

        <div className="sbs-modal-header">
          <div className="sbs-modal-icon" style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)" }}>🔖</div>
          <div className="sbs-modal-header-text">
            <h3>Reserve Book</h3>
            <p>We'll hold it when a copy is returned</p>
          </div>
          <button className="sbs-modal-x" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="sbs-modal-book">
          <div className="sbs-modal-thumb">
            {book.cover_image
              ? <img src={`${API}/uploads/${book.cover_image}`} alt={book.title} />
              : <div className="sbs-modal-thumb-ph" style={{ background: "#8b5cf622" }}>📗</div>}
          </div>
          <div className="sbs-modal-book-info">
            <h4 className="sbs-modal-book-title">{book.title}</h4>
            <p className="sbs-modal-book-author">by {book.author}</p>
            <span className="sbs-unavail-badge">Currently Unavailable</span>
          </div>
        </div>

        <div className="sbs-modal-field">
          <label htmlFor="pickup-deadline">📅 Pickup Deadline</label>
          <input
            id="pickup-deadline"
            type="date"
            className="sbs-modal-input"
            value={deadline}
            min={today.toISOString().split("T")[0]}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <div className="sbs-modal-notice">
          <span>ℹ️</span>
          <p>Once a copy becomes available, you'll have until your pickup deadline to collect the book. After that, the reservation expires automatically.</p>
        </div>

        <div className="sbs-modal-footer">
          <button className="sbs-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button
            className="sbs-btn-primary"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)" }}
            onClick={() => onConfirm(deadline)}
            disabled={loading || !deadline}
          >
            {loading ? <><span className="sbs-btn-spinner" /> Processing...</> : "🔖 Confirm Reserve"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Book Card (Grid) ─────────────────────────────────────────────────────────
function BookCard({ book, idx, onBorrow, onReserve }) {
  const avail = book.available_copies > 0;
  const color = getCatColor(book.category);

  return (
    <div className="sbs-card" style={{ animationDelay: `${Math.min(idx * 0.05, 0.5)}s` }}>
      <div className="sbs-card-stripe" style={{ background: color }} />

      <div className="sbs-card-cover">
        {book.cover_image
          ? <img src={`${API}/uploads/${book.cover_image}`} alt={book.title} />
          : (
            <div className="sbs-card-cover-ph" style={{ background: `linear-gradient(135deg,${color}18,${color}33)` }}>
              <span>📗</span>
            </div>
          )
        }
        <div className={`sbs-card-avail ${avail ? "sbs-card-avail--yes" : "sbs-card-avail--no"}`}>
          {avail ? `${book.available_copies} left` : "Unavailable"}
        </div>
      </div>

      <div className="sbs-card-body">
        <span className="sbs-card-cat" style={{ background: color + "14", color }}>{book.category}</span>
        <h3 className="sbs-card-title" title={book.title}>{book.title}</h3>
        <p className="sbs-card-author">by {book.author}</p>
        <div className="sbs-card-meta">
          <span>📅 {book.publication_year || "—"}</span>
          <span>🔢 {book.isbn || "—"}</span>
        </div>
      </div>

      <div className="sbs-card-footer">
        {avail ? (
          <button className="sbs-btn-borrow" onClick={() => onBorrow(book)}>📖 Borrow</button>
        ) : (
          <button className="sbs-btn-reserve" onClick={() => onReserve(book)}>🔖 Reserve</button>
        )}
      </div>
    </div>
  );
}

// ─── Book Row (List) ──────────────────────────────────────────────────────────
function BookRow({ book, idx, onBorrow, onReserve }) {
  const avail = book.available_copies > 0;
  const color = getCatColor(book.category);

  return (
    <div className="sbs-row" style={{ animationDelay: `${Math.min(idx * 0.03, 0.3)}s` }}>
      <div className="sbs-row-thumb">
        {book.cover_image
          ? <img src={`${API}/uploads/${book.cover_image}`} alt={book.title} />
          : <div className="sbs-row-thumb-ph" style={{ background: color + "22" }}>📗</div>}
      </div>
      <div className="sbs-row-title-col">
        <span className="sbs-row-title">{book.title}</span>
        <span className="sbs-row-author">by {book.author}</span>
      </div>
      <span className="sbs-row-cat" style={{ background: color + "14", color }}>{book.category}</span>
      <span className="sbs-row-year">{book.publication_year || "—"}</span>
      <span className="sbs-row-isbn">{book.isbn || "—"}</span>
      <span className="sbs-row-copies">{book.available_copies} / {book.total_copies}</span>
      <span className={`sbs-row-status ${avail ? "sbs-row-status--yes" : "sbs-row-status--no"}`}>
        {avail ? "✓ Available" : "✗ Unavailable"}
      </span>
      <div className="sbs-row-action">
        {avail
          ? <button className="sbs-btn-borrow sm" onClick={() => onBorrow(book)}>Borrow</button>
          : <button className="sbs-btn-reserve sm" onClick={() => onReserve(book)}>Reserve</button>}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function StudentBookSearch() {
  const user   = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;

  // Data
  const [books,         setBooks]         = useState([]);
  const [pageLoading,   setPageLoading]   = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [search,       setSearch]       = useState("");
  const [category,     setCategory]     = useState("all");
  const [year,         setYear]         = useState("all");
  const [availability, setAvailability] = useState("all");
  const [sortBy,       setSortBy]       = useState("newest");

  // UI
  const [view,         setView]         = useState("grid");  // "grid" | "list"
  const [borrowModal,  setBorrowModal]  = useState(null);
  const [reserveModal, setReserveModal] = useState(null);
  const [toasts,       setToasts]       = useState([]);

  // ── Toast helpers ──
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Fetch books ──
  useEffect(() => {
    setPageLoading(true);
    fetch(`${API}/books`)
      .then((r) => { if (!r.ok) throw new Error("Network error"); return r.json(); })
      .then((data) => setBooks(Array.isArray(data) ? data : []))
      .catch(() => addToast("Failed to load books. Check if the server is running.", "error"))
      .finally(() => setPageLoading(false));
  }, [addToast]);

  // ── Filter + sort ──
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = books.filter((b) => {
      const matchSearch =
        !q ||
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.isbn?.toLowerCase().includes(q);

      const matchCat  = category === "all" || b.category === category;
      const matchAvail =
        availability === "all" ||
        (availability === "available"   && b.available_copies > 0) ||
        (availability === "unavailable" && b.available_copies === 0);
      const matchYear =
        year === "all" ||
        (year === "2020+"       && b.publication_year >= 2020) ||
        (year === "2010-2019"   && b.publication_year >= 2010 && b.publication_year < 2020) ||
        (year === "Before 2010" && b.publication_year < 2010);

      return matchSearch && matchCat && matchAvail && matchYear;
    });

    if (sortBy === "title")  result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === "author") result = [...result].sort((a, b) => a.author.localeCompare(b.author));
    if (sortBy === "newest") result = [...result].sort((a, b) => b.id - a.id);
    return result;
  }, [books, search, category, availability, year, sortBy]);

  // Active filter count (for badge)
  const activeFilterCount = [
    search,
    category !== "all" && category,
    year !== "all" && year,
    availability !== "all" && availability,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch(""); setCategory("all"); setYear("all");
    setAvailability("all"); setSortBy("newest");
  };

  // ── Borrow ──
  const handleBorrow = async (dueDate) => {
    if (!userId) { addToast("You must be logged in to borrow books.", "error"); return; }
    setActionLoading(true);
    try {
      const res  = await fetch(`${API}/borrowing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, book_id: borrowModal.id, due_date: dueDate }),
      });
      const data = await res.json();
      if (data.success) {
        setBooks((prev) =>
          prev.map((b) =>
            b.id === borrowModal.id ? { ...b, available_copies: b.available_copies - 1 } : b
          )
        );
        addToast(`"${borrowModal.title}" borrowed successfully! Due: ${new Date(dueDate).toLocaleDateString()}`, "success");
        setBorrowModal(null);
      } else {
        addToast(data.message || "Borrow failed. Please try again.", "error");
      }
    } catch {
      addToast("Network error. Make sure the server is running.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Reserve ──
  const handleReserve = async (deadline) => {
    if (!userId) { addToast("You must be logged in to reserve books.", "error"); return; }
    setActionLoading(true);
    try {
      const res  = await fetch(`${API}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, book_id: reserveModal.id, pickup_deadline: deadline }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`"${reserveModal.title}" reserved! We'll notify you when available.`, "success");
        setReserveModal(null);
      } else {
        addToast(data.message || "Reservation failed.", "error");
      }
    } catch {
      addToast("Network error. Make sure the server is running.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Computed stats ──
  const totalBooks     = books.length;
  const availableBooks = books.filter((b) => b.available_copies > 0).length;
  const totalCategories = [...new Set(books.map((b) => b.category).filter(Boolean))].length;

  return (
    <DashboardLayout userRole="student">

      <div className="sbs-root">

        {/* ══ HERO BANNER ══════════════════════════════════ */}
        <div className="sbs-hero">
          <div className="sbs-hero-glow sbs-hero-glow--1" />
          <div className="sbs-hero-glow sbs-hero-glow--2" />

          <div className="sbs-hero-inner">
            <div className="sbs-hero-left">
              <div className="sbs-hero-eyebrow">📚 Library Collection</div>
              <h1 className="sbs-hero-title">
                Discover Your Next<br />
                <em className="sbs-hero-em">Great Read</em>
              </h1>
              <p className="sbs-hero-desc">
                Browse our full collection, borrow instantly, or reserve a copy that's coming soon.
              </p>
              <div className="sbs-hero-stats">
                {[
                  { num: totalBooks,      label: "Total Books"  },
                  { num: availableBooks,  label: "Available"    },
                  { num: totalCategories, label: "Categories"   },
                ].map((s, i) => (
                  <React.Fragment key={s.label}>
                    {i > 0 && <div className="sbs-stat-div" />}
                    <div className="sbs-stat">
                      <span className="sbs-stat-num">{s.num}</span>
                      <span className="sbs-stat-label">{s.label}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="sbs-hero-right">
              <div className="sbs-hero-card">
                <span className="sbs-hero-card-icon">🏛️</span>
                <div className="sbs-hero-card-title">ESSSL Library</div>
                <div className="sbs-hero-card-sub">Browse &amp; Borrow</div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ CONTROLS ═════════════════════════════════════ */}
        <div className="sbs-controls">

          {/* Search bar */}
          <div className="sbs-search-wrap">
            <span className="sbs-search-icon">🔍</span>
            <input
              type="text"
              className="sbs-search"
              placeholder="Search by title, author, or ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="sbs-search-clear" onClick={() => setSearch("")} aria-label="Clear">✕</button>
            )}
          </div>

          {/* Filters */}
          <div className="sbs-filter-row">
            <div className="sbs-filter-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="sbs-select">
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sbs-filter-group">
              <label>Year</label>
              <select value={year} onChange={(e) => setYear(e.target.value)} className="sbs-select">
                <option value="all">All Years</option>
                <option value="2020+">2020 and newer</option>
                <option value="2010-2019">2010 – 2019</option>
                <option value="Before 2010">Before 2010</option>
              </select>
            </div>
            <div className="sbs-filter-group">
              <label>Availability</label>
              <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="sbs-select">
                <option value="all">All Books</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Unavailable Only</option>
              </select>
            </div>
            <div className="sbs-filter-group">
              <label>Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sbs-select">
                <option value="newest">Newest First</option>
                <option value="title">Title A–Z</option>
                <option value="author">Author A–Z</option>
              </select>
            </div>
            {activeFilterCount > 0 && (
              <button className="sbs-clear-btn" onClick={clearFilters}>
                ✕ Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
              </button>
            )}
          </div>

          {/* Results bar */}
          <div className="sbs-results-bar">
            <span className="sbs-results-count">
              {pageLoading
                ? "Loading books..."
                : `${filtered.length} book${filtered.length !== 1 ? "s" : ""} found`}
            </span>
            <div className="sbs-view-toggle">
              <button
                className={`sbs-view-btn ${view === "grid" ? "sbs-view-btn--active" : ""}`}
                onClick={() => setView("grid")}
                title="Grid view"
              >⊞ Grid</button>
              <button
                className={`sbs-view-btn ${view === "list" ? "sbs-view-btn--active" : ""}`}
                onClick={() => setView("list")}
                title="List view"
              >☰ List</button>
            </div>
          </div>
        </div>

        {/* ══ LOADING ══════════════════════════════════════ */}
        {pageLoading && (
          <div className="sbs-loading">
            <div className="sbs-loading-spinner" />
            <p>Loading library collection...</p>
          </div>
        )}

        {/* ══ EMPTY STATE ══════════════════════════════════ */}
        {!pageLoading && filtered.length === 0 && (
          <div className="sbs-empty">
            <div className="sbs-empty-icon">📭</div>
            <h3>No books found</h3>
            <p>Try adjusting your search terms or filters</p>
            {activeFilterCount > 0 && (
              <button className="sbs-empty-btn" onClick={clearFilters}>Clear all filters</button>
            )}
          </div>
        )}

        {/* ══ GRID VIEW ════════════════════════════════════ */}
        {!pageLoading && filtered.length > 0 && view === "grid" && (
          <div className="sbs-grid">
            {filtered.map((book, i) => (
              <BookCard
                key={book.id}
                book={book}
                idx={i}
                onBorrow={() => setBorrowModal(book)}
                onReserve={() => setReserveModal(book)}
              />
            ))}
          </div>
        )}

        {/* ══ LIST VIEW ════════════════════════════════════ */}
        {!pageLoading && filtered.length > 0 && view === "list" && (
          <div className="sbs-list-wrap">
            <div className="sbs-list-head">
              <span className="sbs-lh-title">Book</span>
              <span>Category</span>
              <span>Year</span>
              <span>ISBN</span>
              <span>Copies</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {filtered.map((book, i) => (
              <BookRow
                key={book.id}
                book={book}
                idx={i}
                onBorrow={() => setBorrowModal(book)}
                onReserve={() => setReserveModal(book)}
              />
            ))}
          </div>
        )}

      </div>

      {/* ══ MODALS ══════════════════════════════════════════ */}
      {borrowModal && (
        <BorrowModal
          book={borrowModal}
          onClose={() => !actionLoading && setBorrowModal(null)}
          onConfirm={handleBorrow}
          loading={actionLoading}
        />
      )}
      {reserveModal && (
        <ReserveModal
          book={reserveModal}
          onClose={() => !actionLoading && setReserveModal(null)}
          onConfirm={handleReserve}
          loading={actionLoading}
        />
      )}

      {/* ══ TOASTS ══════════════════════════════════════════ */}
      <Toast toasts={toasts} remove={removeToast} />

    </DashboardLayout>
  );
}