import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
import "../styles/AdminManageBooks.css";

const API = "http://localhost:5000";

const CATEGORIES = ["Fiction", "Non-Fiction", "Science", "History", "Biography", "Technology", "Mathematics", "Literature", "Philosophy", "Arts"];

const emptyBook = {
  id: null, title: "", author: "", isbn: "",
  category: "", year: "", copies: "", cover: null,
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="amb-toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`amb-toast amb-toast--${t.type}`}>
          <span className="amb-toast-icon">{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
          <span className="amb-toast-msg">{t.message}</span>
          <button className="amb-toast-x" onClick={() => remove(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ book, onClose, onConfirm, loading }) {
  return (
    <div className="amb-backdrop" onClick={onClose}>
      <div className="amb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="amb-modal-top">
          <div className="amb-modal-icon amb-modal-icon--delete">🗑️</div>
          <div>
            <h3 className="amb-modal-title">Delete Book</h3>
            <p className="amb-modal-sub">This action cannot be undone</p>
          </div>
          <button className="amb-modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="amb-modal-book-row">
          <div className="amb-modal-thumb">
            {book.cover_image
              ? <img src={`${API}/uploads/${book.cover_image}`} alt={book.title} />
              : <div className="amb-modal-thumb-ph">📗</div>}
          </div>
          <div className="amb-modal-book-info">
            <h4>{book.title}</h4>
            <p>by {book.author}</p>
            <p className="amb-modal-isbn">ISBN: {book.isbn || "—"}</p>
          </div>
        </div>
        <div className="amb-modal-warning">
          ⚠️ Deleting this book will permanently remove it and all related records from the system.
        </div>
        <div className="amb-modal-footer">
          <button className="amb-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="amb-btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <><span className="amb-spinner-sm" /> Deleting...</> : "🗑️ Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Book Form Drawer ──────────────────────────────────────────────────────────
function BookFormDrawer({ book, isEditing, onChange, onFileChange, onSave, onClose, loading }) {
  const [preview, setPreview] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onFileChange(file);
    }
  };

  return (
    <div className="amb-drawer-backdrop" onClick={onClose}>
      <div className="amb-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="amb-drawer-header">
          <div className="amb-drawer-icon">{isEditing ? "✏️" : "➕"}</div>
          <div>
            <h2 className="amb-drawer-title">{isEditing ? "Edit Book" : "Add New Book"}</h2>
            <p className="amb-drawer-sub">{isEditing ? "Update book details" : "Add a book to the library"}</p>
          </div>
          <button className="amb-drawer-close" onClick={onClose}>✕</button>
        </div>

        <div className="amb-drawer-body">
          {/* Cover preview */}
          <div className="amb-cover-upload">
            <div className="amb-cover-preview">
              {preview ? (
                <img src={preview} alt="Preview" />
              ) : book.cover_image ? (
                <img src={`${API}/uploads/${book.cover_image}`} alt="Cover" />
              ) : (
                <div className="amb-cover-ph">📗</div>
              )}
            </div>
            <div className="amb-cover-info">
              <div className="amb-cover-label">Book Cover</div>
              <label className="amb-cover-btn">
                📷 Choose Image
                <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
              </label>
              <div className="amb-cover-hint">JPG, PNG, WebP · Max 5MB</div>
            </div>
          </div>

          <div className="amb-form-grid">
            <div className="amb-field amb-field--full">
              <label className="amb-label">Title <span className="amb-req">*</span></label>
              <input className="amb-input" name="title" value={book.title} onChange={onChange} placeholder="Book title" />
            </div>
            <div className="amb-field amb-field--full">
              <label className="amb-label">Author <span className="amb-req">*</span></label>
              <input className="amb-input" name="author" value={book.author} onChange={onChange} placeholder="Author name" />
            </div>
            <div className="amb-field">
              <label className="amb-label">ISBN</label>
              <input className="amb-input" name="isbn" value={book.isbn} onChange={onChange} placeholder="978-..." />
            </div>
            <div className="amb-field">
              <label className="amb-label">Category <span className="amb-req">*</span></label>
              <select className="amb-input" name="category" value={book.category} onChange={onChange}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="amb-field">
              <label className="amb-label">Publication Year</label>
              <input className="amb-input" type="number" name="year" value={book.year} onChange={onChange} placeholder="2024" min="1000" max="2099" />
            </div>
            <div className="amb-field">
              <label className="amb-label">Total Copies</label>
              <input className="amb-input" type="number" name="copies" value={book.copies} onChange={onChange} placeholder="1" min="1" />
            </div>
          </div>
        </div>

        <div className="amb-drawer-footer">
          <button className="amb-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="amb-btn-primary" onClick={onSave} disabled={loading}>
            {loading
              ? <><span className="amb-spinner-sm" /> {isEditing ? "Saving..." : "Adding..."}</>
              : isEditing ? "✅ Save Changes" : "➕ Add Book"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Book Row Card ─────────────────────────────────────────────────────────────
function BookRow({ book, idx, onEdit, onDelete }) {
  const isAvailable = book.available_copies > 0;
  return (
    <div className="amb-book-row" style={{ animationDelay: `${Math.min(idx * 0.04, 0.4)}s` }}>
      <div className="amb-book-cover">
        {book.cover_image
          ? <img src={`${API}/uploads/${book.cover_image}`} alt={book.title} />
          : <div className="amb-book-cover-ph">📗</div>}
      </div>
      <div className="amb-book-info">
        <div className="amb-book-title-row">
          <h3 className="amb-book-title">{book.title}</h3>
          <span className={`amb-book-status ${isAvailable ? "available" : "borrowed"}`}>
            {isAvailable ? `✓ ${book.available_copies} Available` : "✕ All Borrowed"}
          </span>
        </div>
        <p className="amb-book-author">by {book.author}</p>
        <div className="amb-book-meta">
          {book.isbn && <span className="amb-book-tag">ISBN: {book.isbn}</span>}
          {book.category && <span className="amb-book-tag">{book.category}</span>}
          {book.publication_year && <span className="amb-book-tag">{book.publication_year}</span>}
          <span className="amb-book-tag">📦 {book.total_copies} copies</span>
        </div>
      </div>
      <div className="amb-book-id">#{book.id}</div>
      <div className="amb-book-actions">
        <button className="amb-row-btn amb-row-btn--edit" onClick={() => onEdit(book)}>✏️ Edit</button>
        <button className="amb-row-btn amb-row-btn--delete" onClick={() => onDelete(book)}>🗑️ Delete</button>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function AdminManageBooks() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBook, setCurrentBook] = useState(emptyBook);
  const [deleteModal, setDeleteModal] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const removeToast = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  const fetchBooks = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/books`);
      setBooks(Array.isArray(res.data) ? res.data : []);
    } catch {
      addToast("Failed to load books.", "error");
    } finally {
      setPageLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentBook((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    if (!currentBook.title || !currentBook.author || !currentBook.category) {
      addToast("Please fill in all required fields (Title, Author, Category).", "error");
      return;
    }
    setActionLoading(true);
    const fd = new FormData();
    fd.append("title", currentBook.title);
    fd.append("author", currentBook.author);
    fd.append("isbn", currentBook.isbn || "");
    fd.append("category", currentBook.category);
    fd.append("publication_year", currentBook.year || "");
    fd.append("total_copies", currentBook.copies || 1);
    if (currentBook.cover) fd.append("cover", currentBook.cover);

    try {
      if (isEditing) {
        await axios.put(`${API}/books/${currentBook.id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        addToast(`"${currentBook.title}" updated successfully!`, "success");
      } else {
        await axios.post(`${API}/books`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        addToast(`"${currentBook.title}" added to library!`, "success");
      }
      setShowForm(false);
      setCurrentBook(emptyBook);
      fetchBooks();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to save book.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setActionLoading(true);
    try {
      await axios.delete(`${API}/books/${deleteModal.id}`);
      setBooks((p) => p.filter((b) => b.id !== deleteModal.id));
      addToast(`"${deleteModal.title}" deleted successfully.`, "info");
      setDeleteModal(null);
    } catch {
      addToast("Failed to delete book.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered list
  const displayed = books.filter((b) => {
    const matchSearch = [b.title, b.author, b.isbn, b.category].join(" ").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "all" || b.category === filterCategory;
    const matchStatus = filterStatus === "all"
      || (filterStatus === "available" && b.available_copies > 0)
      || (filterStatus === "borrowed"  && b.available_copies === 0);
    return matchSearch && matchCat && matchStatus;
  });

  const availableCount = books.filter((b) => b.available_copies > 0).length;
  const borrowedCount  = books.filter((b) => b.available_copies === 0).length;
  const totalCopies    = books.reduce((s, b) => s + (b.total_copies || 0), 0);

  return (
    <DashboardLayout userRole="admin">
      <div className="amb-root">

        {/* ══ HERO ════════════════════════════════════════ */}
        <div className="amb-hero">
          <div className="amb-hero-blob amb-hero-blob--1" />
          <div className="amb-hero-blob amb-hero-blob--2" />
          <div className="amb-hero-inner">
            <div className="amb-hero-left">
              <div className="amb-hero-eyebrow">📚 Admin Panel</div>
              <h1 className="amb-hero-title">
                Book <em className="amb-hero-em">Management</em>
              </h1>
              <p className="amb-hero-desc">
                Add, edit, and manage the library's book inventory. Track availability and copies in real time.
              </p>
            </div>
            <div className="amb-hero-chips">
              {[
                { icon: "📚", num: books.length,    label: "Total Books",   cls: "chip--blue"   },
                { icon: "✅", num: availableCount,  label: "Available",     cls: "chip--green"  },
                { icon: "🔄", num: borrowedCount,   label: "All Borrowed",  cls: "chip--amber"  },
                { icon: "📦", num: totalCopies,     label: "Total Copies",  cls: "chip--purple" },
              ].map((c) => (
                <div key={c.label} className={`amb-chip ${c.cls}`}>
                  <span className="amb-chip-icon">{c.icon}</span>
                  <span className="amb-chip-num">{c.num}</span>
                  <span className="amb-chip-label">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ TOOLBAR ═════════════════════════════════════ */}
        <div className="amb-toolbar">
          <div className="amb-toolbar-left">
            <div className="amb-search-wrap">
              <span className="amb-search-icon">🔍</span>
              <input
                className="amb-search"
                type="text"
                placeholder="Search title, author, ISBN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="amb-search-clear" onClick={() => setSearch("")}>✕</button>
              )}
            </div>
            <select className="amb-filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select className="amb-filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="borrowed">All Borrowed</option>
            </select>
          </div>
          <button className="amb-add-btn" onClick={() => { setCurrentBook(emptyBook); setIsEditing(false); setShowForm(true); }}>
            ➕ Add New Book
          </button>
        </div>

        {/* ══ RESULTS INFO ════════════════════════════════ */}
        {!pageLoading && (
          <div className="amb-results-info">
            Showing <strong>{displayed.length}</strong> of <strong>{books.length}</strong> books
            {(search || filterCategory !== "all" || filterStatus !== "all") && (
              <button className="amb-clear-filters" onClick={() => { setSearch(""); setFilterCategory("all"); setFilterStatus("all"); }}>
                Clear filters ✕
              </button>
            )}
          </div>
        )}

        {/* ══ CONTENT ══════════════════════════════════════ */}
        <div className="amb-content">
          {pageLoading ? (
            <div className="amb-loading">
              <div className="amb-loading-spin" />
              <p>Loading book inventory...</p>
            </div>
          ) : displayed.length === 0 ? (
            <div className="amb-empty">
              <div className="amb-empty-icon">{books.length === 0 ? "📭" : "🔍"}</div>
              <h3>{books.length === 0 ? "No books in the library yet" : "No books match your search"}</h3>
              <p>{books.length === 0 ? "Start by adding your first book to the inventory." : "Try adjusting your search or filters."}</p>
              {books.length === 0 ? (
                <button className="amb-empty-btn" onClick={() => { setCurrentBook(emptyBook); setIsEditing(false); setShowForm(true); }}>
                  ➕ Add First Book
                </button>
              ) : (
                <button className="amb-empty-btn" onClick={() => { setSearch(""); setFilterCategory("all"); setFilterStatus("all"); }}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="amb-book-list">
              {displayed.map((book, i) => (
                <BookRow
                  key={book.id}
                  book={book}
                  idx={i}
                  onEdit={(b) => { setCurrentBook({ ...b, year: b.publication_year || "", copies: b.total_copies || "", cover: null }); setIsEditing(true); setShowForm(true); }}
                  onDelete={(b) => setDeleteModal(b)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ FORM DRAWER ══ */}
      {showForm && (
        <BookFormDrawer
          book={currentBook}
          isEditing={isEditing}
          onChange={handleChange}
          onFileChange={(file) => setCurrentBook((p) => ({ ...p, cover: file }))}
          onSave={handleSave}
          onClose={() => { if (!actionLoading) { setShowForm(false); setCurrentBook(emptyBook); } }}
          loading={actionLoading}
        />
      )}

      {/* ══ DELETE MODAL ══ */}
      {deleteModal && (
        <DeleteModal
          book={deleteModal}
          onClose={() => !actionLoading && setDeleteModal(null)}
          onConfirm={handleDelete}
          loading={actionLoading}
        />
      )}

      <Toast toasts={toasts} remove={removeToast} />
    </DashboardLayout>
  );
}