import { useState, useRef, useEffect } from "react";
import "../styles/adminBookForm.css";

const API = "http://localhost:5000";

const CATEGORIES = [
  "Fiction", "Dystopian", "Self-Help", "Fantasy", "Romance",
  "Memoir", "Non-Fiction", "Science", "History", "Technology",
  "Biography", "Mystery",
];

const EMPTY_FORM = {
  title: "", author: "", isbn: "", category: "",
  publication_year: "", total_copies: "",
};

/**
 * AdminBookForm
 *
 * Props:
 *   book        — book object for editing (null = add mode)
 *   onSuccess   — callback(book) after save
 *   onCancel    — callback to close/dismiss
 */
export default function AdminBookForm({ book = null, onSuccess, onCancel }) {
  const isEdit = !!book;

  const [form,        setForm]        = useState(isEdit ? {
    title:            book.title            || "",
    author:           book.author           || "",
    isbn:             book.isbn             || "",
    category:         book.category         || "",
    publication_year: book.publication_year || "",
    total_copies:     book.total_copies     || "",
  } : EMPTY_FORM);

  const [coverFile,    setCoverFile]    = useState(null);   // File object
  const [preview,      setPreview]      = useState(         // preview URL
    isEdit && book.cover_image
      ? `${API}/uploads/${book.cover_image}`
      : null
  );
  const [dragOver,     setDragOver]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [errors,       setErrors]       = useState({});
  const [serverError,  setServerError]  = useState("");

  const fileInputRef = useRef();

  // Clean up object URL on unmount
  useEffect(() => {
    return () => { if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview); };
  }, [preview]);

  // ── Field change ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  // ── File selection ──
  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, cover: "Please select an image file (jpg, png, gif, webp)" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, cover: "Image must be under 5 MB" }));
      return;
    }
    setCoverFile(file);
    setErrors((p) => ({ ...p, cover: "" }));
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleFileInput  = (e) => handleFile(e.target.files[0]);
  const handleDrop       = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };
  const handleDragOver   = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave  = () => setDragOver(false);
  const handleRemoveCover = () => {
    setCoverFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Validation ──
  const validate = () => {
    const e = {};
    if (!form.title.trim())            e.title    = "Title is required";
    if (!form.author.trim())           e.author   = "Author is required";
    if (!form.category)                e.category = "Please select a category";
    if (!form.total_copies || isNaN(form.total_copies) || Number(form.total_copies) < 1)
                                       e.total_copies = "Enter a valid number of copies (min 1)";
    if (form.publication_year && (isNaN(form.publication_year) || form.publication_year < 1000 || form.publication_year > new Date().getFullYear()))
                                       e.publication_year = `Enter a valid year (1000–${new Date().getFullYear()})`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (coverFile) fd.append("cover", coverFile);

      const url    = isEdit ? `${API}/books/${book.id}` : `${API}/books`;
      const method = isEdit ? "PUT" : "POST";

      const res  = await fetch(url, { method, body: fd });
      const data = await res.json();

      if (data.success) {
        onSuccess && onSuccess(data);
      } else {
        setServerError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setServerError("Network error — make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="abf-root">

      {/* ── HEADER ── */}
      <div className="abf-header">
        <div className="abf-header-icon">{isEdit ? "✏️" : "📗"}</div>
        <div>
          <h2 className="abf-header-title">{isEdit ? "Edit Book" : "Add New Book"}</h2>
          <p className="abf-header-sub">
            {isEdit ? `Editing: ${book.title}` : "Fill in the details to add a book to the library"}
          </p>
        </div>
        {onCancel && (
          <button className="abf-close-btn" onClick={onCancel} type="button" aria-label="Close">✕</button>
        )}
      </div>

      <form className="abf-form" onSubmit={handleSubmit} encType="multipart/form-data">

        {/* ── SERVER ERROR ── */}
        {serverError && (
          <div className="abf-server-error">
            <span>⚠️</span> {serverError}
          </div>
        )}

        <div className="abf-body">

          {/* ── LEFT: Image Upload ── */}
          <div className="abf-left">
            <label className="abf-section-label">Book Cover Image</label>

            {/* Drop zone / preview */}
            <div
              className={`abf-dropzone ${dragOver ? "abf-dropzone--drag" : ""} ${preview ? "abf-dropzone--has-image" : ""}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !preview && fileInputRef.current?.click()}
            >
              {preview ? (
                <>
                  <img src={preview} alt="Cover preview" className="abf-preview-img" />
                  <div className="abf-preview-overlay">
                    <button
                      type="button"
                      className="abf-preview-change"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                      🔄 Change Image
                    </button>
                    <button
                      type="button"
                      className="abf-preview-remove"
                      onClick={(e) => { e.stopPropagation(); handleRemoveCover(); }}
                    >
                      🗑 Remove
                    </button>
                  </div>
                </>
              ) : (
                <div className="abf-dropzone-inner">
                  <div className="abf-drop-icon">🖼️</div>
                  <p className="abf-drop-title">Drop image here</p>
                  <p className="abf-drop-sub">or click to browse</p>
                  <p className="abf-drop-hint">JPG, PNG, GIF, WEBP · Max 5 MB</p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              style={{ display: "none" }}
              onChange={handleFileInput}
            />

            {errors.cover && <p className="abf-error">{errors.cover}</p>}

            <p className="abf-cover-note">
              💡 If no image is uploaded, the system will auto-fetch a cover from <strong>Open Library</strong> using the ISBN.
            </p>
          </div>

          {/* ── RIGHT: Book Details ── */}
          <div className="abf-right">

            {/* Title */}
            <div className="abf-field">
              <label htmlFor="abf-title">Book Title <span className="abf-req">*</span></label>
              <input
                id="abf-title"
                name="title"
                type="text"
                className={`abf-input ${errors.title ? "abf-input--error" : ""}`}
                placeholder="e.g. The Great Gatsby"
                value={form.title}
                onChange={handleChange}
              />
              {errors.title && <p className="abf-error">{errors.title}</p>}
            </div>

            {/* Author */}
            <div className="abf-field">
              <label htmlFor="abf-author">Author <span className="abf-req">*</span></label>
              <input
                id="abf-author"
                name="author"
                type="text"
                className={`abf-input ${errors.author ? "abf-input--error" : ""}`}
                placeholder="e.g. F. Scott Fitzgerald"
                value={form.author}
                onChange={handleChange}
              />
              {errors.author && <p className="abf-error">{errors.author}</p>}
            </div>

            {/* ISBN */}
            <div className="abf-field">
              <label htmlFor="abf-isbn">
                ISBN
                <span className="abf-label-hint"> — used to auto-fetch cover from Open Library</span>
              </label>
              <input
                id="abf-isbn"
                name="isbn"
                type="text"
                className="abf-input"
                placeholder="e.g. 9780743273565"
                value={form.isbn}
                onChange={handleChange}
              />
            </div>

            {/* Category + Year row */}
            <div className="abf-row">
              <div className="abf-field">
                <label htmlFor="abf-category">Category <span className="abf-req">*</span></label>
                <select
                  id="abf-category"
                  name="category"
                  className={`abf-select ${errors.category ? "abf-input--error" : ""}`}
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="abf-error">{errors.category}</p>}
              </div>

              <div className="abf-field">
                <label htmlFor="abf-year">Publication Year</label>
                <input
                  id="abf-year"
                  name="publication_year"
                  type="number"
                  className={`abf-input ${errors.publication_year ? "abf-input--error" : ""}`}
                  placeholder={`e.g. ${new Date().getFullYear()}`}
                  min="1000"
                  max={new Date().getFullYear()}
                  value={form.publication_year}
                  onChange={handleChange}
                />
                {errors.publication_year && <p className="abf-error">{errors.publication_year}</p>}
              </div>
            </div>

            {/* Total Copies */}
            <div className="abf-field">
              <label htmlFor="abf-copies">Total Copies <span className="abf-req">*</span></label>
              <input
                id="abf-copies"
                name="total_copies"
                type="number"
                className={`abf-input ${errors.total_copies ? "abf-input--error" : ""}`}
                placeholder="e.g. 5"
                min="1"
                value={form.total_copies}
                onChange={handleChange}
              />
              {errors.total_copies && <p className="abf-error">{errors.total_copies}</p>}
            </div>

          </div>
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div className="abf-footer">
          {onCancel && (
            <button type="button" className="abf-btn-cancel" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
          )}
          <button type="submit" className="abf-btn-submit" disabled={loading}>
            {loading
              ? <><span className="abf-spinner" /> {isEdit ? "Saving..." : "Adding..."}</>
              : isEdit ? "💾 Save Changes" : "➕ Add Book"}
          </button>
        </div>

      </form>
    </div>
  );
}