import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
import "../styles/AdminManageStudents.css";

const API = "http://localhost:5000";

const DEPARTMENTS = [
  "Computer Science", "Engineering", "Business", "Medicine",
  "Law", "Arts", "Science", "Mathematics", "Education", "Other"
];

const emptyStudent = {
  id: null, first_name: "", last_name: "", email: "",
  department: "", is_active: 1,
};

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="ams-toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`ams-toast ams-toast--${t.type}`}>
          <span className="ams-toast-icon">{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
          <span className="ams-toast-msg">{t.message}</span>
          <button className="ams-toast-x" onClick={() => remove(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ student, onClose, onConfirm, loading }) {
  return (
    <div className="ams-backdrop" onClick={onClose}>
      <div className="ams-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ams-modal-top">
          <div className="ams-modal-icon ams-modal-icon--delete">🗑️</div>
          <div>
            <h3 className="ams-modal-title">Delete Student</h3>
            <p className="ams-modal-sub">This action cannot be undone</p>
          </div>
          <button className="ams-modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="ams-modal-student-row">
          <div className="ams-modal-avatar">
            {student.first_name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="ams-modal-student-info">
            <h4>{student.first_name} {student.last_name}</h4>
            <p>{student.email}</p>
            <p className="ams-modal-dept">{student.department || "—"}</p>
          </div>
        </div>
        <div className="ams-modal-warning">
          ⚠️ Deleting this student will permanently remove their account and all associated records.
        </div>
        <div className="ams-modal-footer">
          <button className="ams-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="ams-btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <><span className="ams-spinner-sm" /> Deleting...</> : "🗑️ Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── View Details Modal ────────────────────────────────────────────────────────
function ViewModal({ student, borrows, fines, onClose }) {
  const activeBorrows = borrows.filter(b => b.status !== "Returned");
  const pendingFines = fines.filter(f => f.status === "pending");
  const totalFineAmt = pendingFines.reduce((s, f) => s + parseFloat(f.amount || 0), 0);

  return (
    <div className="ams-backdrop" onClick={onClose}>
      <div className="ams-modal ams-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="ams-modal-top">
          <div className="ams-modal-icon ams-modal-icon--view">👤</div>
          <div>
            <h3 className="ams-modal-title">{student.first_name} {student.last_name}</h3>
            <p className="ams-modal-sub">Student Profile</p>
          </div>
          <button className="ams-modal-x" onClick={onClose}>✕</button>
        </div>

        <div className="ams-view-body">
          {/* Info grid */}
          <div className="ams-view-info-grid">
            <div className="ams-view-field">
              <span className="ams-view-label">Email</span>
              <span className="ams-view-val">{student.email}</span>
            </div>
            <div className="ams-view-field">
              <span className="ams-view-label">Department</span>
              <span className="ams-view-val">{student.department || "—"}</span>
            </div>
            <div className="ams-view-field">
              <span className="ams-view-label">Status</span>
              <span className={`ams-status-badge ${student.is_active ? "active" : "blocked"}`}>
                {student.is_active ? "✓ Active" : "✕ Blocked"}
              </span>
            </div>
            <div className="ams-view-field">
              <span className="ams-view-label">Member Since</span>
              <span className="ams-view-val">{fmtDate(student.created_at)}</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="ams-view-stats">
            <div className="ams-view-stat ams-view-stat--blue">
              <div className="ams-view-stat-num">{borrows.length}</div>
              <div className="ams-view-stat-label">Total Borrows</div>
            </div>
            <div className="ams-view-stat ams-view-stat--indigo">
              <div className="ams-view-stat-num">{activeBorrows.length}</div>
              <div className="ams-view-stat-label">Active Borrows</div>
            </div>
            <div className="ams-view-stat ams-view-stat--red">
              <div className="ams-view-stat-num">{pendingFines.length}</div>
              <div className="ams-view-stat-label">Pending Fines</div>
            </div>
            <div className="ams-view-stat ams-view-stat--amber">
              <div className="ams-view-stat-num">LKR {totalFineAmt.toFixed(2)}</div>
              <div className="ams-view-stat-label">Fine Amount</div>
            </div>
          </div>

          {/* Active borrows */}
          {activeBorrows.length > 0 && (
            <div className="ams-view-section">
              <div className="ams-view-section-title">📖 Active Borrowings</div>
              <div className="ams-view-borrow-list">
                {activeBorrows.slice(0, 4).map(b => {
                  const due = new Date(b.due_date); due.setHours(0,0,0,0);
                  const today = new Date(); today.setHours(0,0,0,0);
                  const isOverdue = due < today;
                  return (
                    <div key={b.id} className="ams-view-borrow-row">
                      <span className="ams-view-borrow-title">📚 {b.book_title}</span>
                      <span className={`ams-activity-status ${isOverdue ? "overdue" : "active"}`}>
                        {isOverdue ? "⚠ Overdue" : "● Active"}
                      </span>
                      <span className="ams-view-borrow-due">Due: {fmtDate(b.due_date)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="ams-modal-footer">
          <button className="ams-btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Student Form Drawer ───────────────────────────────────────────────────────
function StudentFormDrawer({ student, isEditing, onChange, onSave, onClose, loading }) {
  return (
    <div className="ams-drawer-backdrop" onClick={onClose}>
      <div className="ams-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="ams-drawer-header">
          <div className="ams-drawer-icon">{isEditing ? "✏️" : "➕"}</div>
          <div>
            <h2 className="ams-drawer-title">{isEditing ? "Edit Student" : "Add New Student"}</h2>
            <p className="ams-drawer-sub">{isEditing ? "Update student details" : "Register a new student"}</p>
          </div>
          <button className="ams-drawer-close" onClick={onClose}>✕</button>
        </div>

        <div className="ams-drawer-body">
          <div className="ams-form-grid">
            <div className="ams-field">
              <label className="ams-label">First Name <span className="ams-req">*</span></label>
              <input className="ams-input" name="first_name" value={student.first_name} onChange={onChange} placeholder="John" />
            </div>
            <div className="ams-field">
              <label className="ams-label">Last Name <span className="ams-req">*</span></label>
              <input className="ams-input" name="last_name" value={student.last_name} onChange={onChange} placeholder="Doe" />
            </div>
            <div className="ams-field ams-field--full">
              <label className="ams-label">Email <span className="ams-req">*</span></label>
              <input className="ams-input" name="email" type="email" value={student.email} onChange={onChange} placeholder="student@example.com" />
            </div>
            {!isEditing && (
              <div className="ams-field ams-field--full">
                <label className="ams-label">Password <span className="ams-req">*</span></label>
                <input className="ams-input" name="password" type="password" value={student.password || ""} onChange={onChange} placeholder="Set initial password" />
              </div>
            )}
            <div className="ams-field ams-field--full">
              <label className="ams-label">Department</label>
              <select className="ams-input" name="department" value={student.department} onChange={onChange}>
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="ams-field ams-field--full">
              <label className="ams-label">Status</label>
              <div className="ams-toggle-row">
                <span className="ams-toggle-label">Account Active</span>
                <button
                  type="button"
                  className={`ams-toggle ${student.is_active ? "on" : "off"}`}
                  onClick={() => onChange({ target: { name: "is_active", value: student.is_active ? 0 : 1 } })}
                >
                  <div className="ams-toggle-thumb" />
                </button>
                <span className={`ams-toggle-status ${student.is_active ? "text-green" : "text-red"}`}>
                  {student.is_active ? "Active" : "Blocked"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="ams-drawer-footer">
          <button className="ams-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="ams-btn-primary" onClick={onSave} disabled={loading}>
            {loading
              ? <><span className="ams-spinner-sm" /> {isEditing ? "Saving..." : "Adding..."}</>
              : isEditing ? "✅ Save Changes" : "➕ Add Student"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Student Row ───────────────────────────────────────────────────────────────
function StudentRow({ student, idx, onEdit, onDelete, onToggleStatus, onView }) {
  const isActive = student.is_active === 1 || student.is_active === true;
  const initials = `${student.first_name?.[0] || ""}${student.last_name?.[0] || ""}`.toUpperCase();

  const avatarColors = [
    "linear-gradient(135deg,#6366f1,#8b5cf6)",
    "linear-gradient(135deg,#3b82f6,#2563eb)",
    "linear-gradient(135deg,#10b981,#059669)",
    "linear-gradient(135deg,#f59e0b,#d97706)",
    "linear-gradient(135deg,#ef4444,#dc2626)",
    "linear-gradient(135deg,#8b5cf6,#7c3aed)",
  ];
  const color = avatarColors[student.id % avatarColors.length];

  return (
    <div className="ams-student-row" style={{ animationDelay: `${Math.min(idx * 0.04, 0.4)}s` }}>
      <div className="ams-student-avatar" style={{ background: color }}>{initials}</div>

      <div className="ams-student-info">
        <div className="ams-student-name-row">
          <h3 className="ams-student-name">{student.first_name} {student.last_name}</h3>
          <span className={`ams-status-badge ${isActive ? "active" : "blocked"}`}>
            {isActive ? "✓ Active" : "✕ Blocked"}
          </span>
        </div>
        <p className="ams-student-email">✉️ {student.email}</p>
        <div className="ams-student-meta">
          {student.department && <span className="ams-student-tag">🎓 {student.department}</span>}
          <span className="ams-student-tag">📅 Joined {fmtDate(student.created_at)}</span>
          <span className="ams-student-tag">ID: #{student.id}</span>
        </div>
      </div>

      <div className="ams-student-actions">
        <button className="ams-row-btn ams-row-btn--view" onClick={() => onView(student)}>👁 View</button>
        <button className="ams-row-btn ams-row-btn--edit" onClick={() => onEdit(student)}>✏️ Edit</button>
        <button
          className={`ams-row-btn ${isActive ? "ams-row-btn--block" : "ams-row-btn--unblock"}`}
          onClick={() => onToggleStatus(student)}
        >
          {isActive ? "🚫 Block" : "✅ Unblock"}
        </button>
        <button className="ams-row-btn ams-row-btn--delete" onClick={() => onDelete(student)}>🗑️</button>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function AdminManageStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(emptyStudent);
  const [deleteModal, setDeleteModal] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [viewBorrows, setViewBorrows] = useState([]);
  const [viewFines, setViewFines] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const removeToast = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/users`, { params: { role: "student" } });
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch {
      addToast("Failed to load students.", "error");
    } finally {
      setPageLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentStudent((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    if (!currentStudent.first_name || !currentStudent.last_name || !currentStudent.email) {
      addToast("Please fill in First Name, Last Name, and Email.", "error");
      return;
    }
    if (!isEditing && !currentStudent.password) {
      addToast("Please set an initial password.", "error");
      return;
    }
    setActionLoading(true);
    try {
      if (isEditing) {
        await axios.put(`${API}/users/${currentStudent.id}`, {
          first_name: currentStudent.first_name,
          last_name: currentStudent.last_name,
          email: currentStudent.email,
          department: currentStudent.department,
          is_active: currentStudent.is_active,
        });
        addToast(`${currentStudent.first_name} ${currentStudent.last_name} updated!`, "success");
      } else {
        await axios.post(`${API}/register`, {
          first_name: currentStudent.first_name,
          last_name: currentStudent.last_name,
          email: currentStudent.email,
          password: currentStudent.password,
          department: currentStudent.department,
          role: "student",
          is_active: currentStudent.is_active,
        });
        addToast(`${currentStudent.first_name} registered successfully!`, "success");
      }
      setShowForm(false);
      setCurrentStudent(emptyStudent);
      fetchStudents();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to save student.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setActionLoading(true);
    try {
      await axios.delete(`${API}/users/${deleteModal.id}`);
      setStudents((p) => p.filter((s) => s.id !== deleteModal.id));
      addToast(`${deleteModal.first_name} ${deleteModal.last_name} deleted.`, "info");
      setDeleteModal(null);
    } catch {
      addToast("Failed to delete student.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (student) => {
    try {
      const res = await axios.patch(`${API}/users/${student.id}/status`);
      const newStatus = res.data.status === "Active" ? 1 : 0;
      setStudents((p) => p.map((s) => s.id === student.id ? { ...s, is_active: newStatus } : s));
      addToast(
        `${student.first_name} ${student.last_name} is now ${res.data.status}.`,
        newStatus ? "success" : "info"
      );
    } catch {
      addToast("Failed to update status.", "error");
    }
  };

  const handleView = async (student) => {
    setViewModal(student);
    try {
      const [borrowRes, fineRes] = await Promise.all([
        axios.get(`${API}/borrowing`, { params: { user_id: student.id } }),
        axios.get(`${API}/fines`, { params: { user_id: student.id } }),
      ]);
      setViewBorrows(borrowRes.data || []);
      setViewFines(fineRes.data || []);
    } catch {
      setViewBorrows([]);
      setViewFines([]);
    }
  };

  // Filtered list
  const displayed = students.filter((s) => {
    const matchSearch = [s.first_name, s.last_name, s.email, s.department].join(" ")
      .toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === "all" || s.department === filterDept;
    const matchStatus = filterStatus === "all"
      || (filterStatus === "active" && (s.is_active === 1 || s.is_active === true))
      || (filterStatus === "blocked" && !s.is_active);
    return matchSearch && matchDept && matchStatus;
  });

  const activeCount  = students.filter((s) => s.is_active === 1 || s.is_active === true).length;
  const blockedCount = students.filter((s) => !s.is_active).length;
  const depts = [...new Set(students.map((s) => s.department).filter(Boolean))];

  return (
    <DashboardLayout userRole="admin">
      <div className="ams-root">

        {/* ══ HERO ════════════════════════════════════════ */}
        <div className="ams-hero">
          <div className="ams-hero-blob ams-hero-blob--1" />
          <div className="ams-hero-blob ams-hero-blob--2" />
          <div className="ams-hero-blob ams-hero-blob--3" />
          <div className="ams-hero-inner">
            <div className="ams-hero-left">
              <div className="ams-hero-eyebrow">👥 Admin Panel</div>
              <h1 className="ams-hero-title">
                Student <em className="ams-hero-em">Management</em>
              </h1>
              <p className="ams-hero-desc">
                Register, edit, and manage student accounts. Monitor borrowing history and fine status in real time.
              </p>
            </div>
            <div className="ams-hero-chips">
              {[
                { icon: "👥", num: students.length,  label: "Total Students", cls: "chip--blue"   },
                { icon: "✅", num: activeCount,       label: "Active",         cls: "chip--green"  },
                { icon: "🚫", num: blockedCount,      label: "Blocked",        cls: "chip--red"    },
                { icon: "🎓", num: depts.length,      label: "Departments",    cls: "chip--purple" },
              ].map((c) => (
                <div key={c.label} className={`ams-chip ${c.cls}`}>
                  <span className="ams-chip-icon">{c.icon}</span>
                  <span className="ams-chip-num">{c.num}</span>
                  <span className="ams-chip-label">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ TOOLBAR ═════════════════════════════════════ */}
        <div className="ams-toolbar">
          <div className="ams-toolbar-left">
            <div className="ams-search-wrap">
              <span className="ams-search-icon">🔍</span>
              <input
                className="ams-search"
                type="text"
                placeholder="Search name, email, department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && <button className="ams-search-clear" onClick={() => setSearch("")}>✕</button>}
            </div>
            <select className="ams-filter-select" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select className="ams-filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          <button className="ams-add-btn" onClick={() => { setCurrentStudent(emptyStudent); setIsEditing(false); setShowForm(true); }}>
            ➕ Add Student
          </button>
        </div>

        {/* ══ RESULTS INFO ════════════════════════════════ */}
        {!pageLoading && (
          <div className="ams-results-info">
            Showing <strong>{displayed.length}</strong> of <strong>{students.length}</strong> students
            {(search || filterDept !== "all" || filterStatus !== "all") && (
              <button className="ams-clear-filters" onClick={() => { setSearch(""); setFilterDept("all"); setFilterStatus("all"); }}>
                Clear filters ✕
              </button>
            )}
          </div>
        )}

        {/* ══ CONTENT ══════════════════════════════════════ */}
        <div className="ams-content">
          {pageLoading ? (
            <div className="ams-loading">
              <div className="ams-loading-spin" />
              <p>Loading students...</p>
            </div>
          ) : displayed.length === 0 ? (
            <div className="ams-empty">
              <div className="ams-empty-icon">{students.length === 0 ? "👥" : "🔍"}</div>
              <h3>{students.length === 0 ? "No students registered yet" : "No students match your search"}</h3>
              <p>{students.length === 0 ? "Start by adding your first student." : "Try adjusting your search or filters."}</p>
              {students.length === 0 ? (
                <button className="ams-empty-btn" onClick={() => { setCurrentStudent(emptyStudent); setIsEditing(false); setShowForm(true); }}>
                  ➕ Add First Student
                </button>
              ) : (
                <button className="ams-empty-btn" onClick={() => { setSearch(""); setFilterDept("all"); setFilterStatus("all"); }}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="ams-student-list">
              {displayed.map((student, i) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  idx={i}
                  onEdit={(s) => {
                    setCurrentStudent({ ...s, password: "" });
                    setIsEditing(true);
                    setShowForm(true);
                  }}
                  onDelete={(s) => setDeleteModal(s)}
                  onToggleStatus={handleToggleStatus}
                  onView={handleView}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ FORM DRAWER ══ */}
      {showForm && (
        <StudentFormDrawer
          student={currentStudent}
          isEditing={isEditing}
          onChange={handleChange}
          onSave={handleSave}
          onClose={() => { if (!actionLoading) { setShowForm(false); setCurrentStudent(emptyStudent); } }}
          loading={actionLoading}
        />
      )}

      {/* ══ DELETE MODAL ══ */}
      {deleteModal && (
        <DeleteModal
          student={deleteModal}
          onClose={() => !actionLoading && setDeleteModal(null)}
          onConfirm={handleDelete}
          loading={actionLoading}
        />
      )}

      {/* ══ VIEW MODAL ══ */}
      {viewModal && (
        <ViewModal
          student={viewModal}
          borrows={viewBorrows}
          fines={viewFines}
          onClose={() => setViewModal(null)}
        />
      )}

      <Toast toasts={toasts} remove={removeToast} />
    </DashboardLayout>
  );
}