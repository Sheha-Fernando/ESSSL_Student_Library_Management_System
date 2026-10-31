import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
import "../styles/StudentProfile.css";

const API = "http://localhost:5000";

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtCurrency = (amount) => `Rs. ${parseFloat(amount || 0).toFixed(2)}`;

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="spb-toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`spb-toast spb-toast--${t.type}`}>
          <span className="spb-toast-icon">
            {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}
          </span>
          <span className="spb-toast-msg">{t.message}</span>
          <button className="spb-toast-x" onClick={() => remove(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ── Save Confirm Modal ────────────────────────────────────────────────────────
function SaveModal({ onClose, onConfirm, loading }) {
  return (
    <div className="spb-backdrop" onClick={onClose}>
      <div className="spb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="spb-modal-top">
          <div className="spb-modal-icon spb-modal-icon--save">✏️</div>
          <div>
            <h3 className="spb-modal-title">Save Changes</h3>
            <p className="spb-modal-sub">Update your profile information</p>
          </div>
          <button className="spb-modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="spb-modal-notice">
          ℹ️ Your profile details will be updated. Make sure your email and department are correct.
        </div>
        <div className="spb-modal-footer">
          <button className="spb-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="spb-btn-primary" onClick={onConfirm} disabled={loading}>
            {loading ? <><span className="spb-spinner-sm" /> Saving...</> : "✅ Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Avatar initials ───────────────────────────────────────────────────────────
function Avatar({ firstName, lastName, size = "lg" }) {
  const initials = `${(firstName || "?")[0]}${(lastName || "")[0] || ""}`.toUpperCase();
  return (
    <div className={`spb-avatar spb-avatar--${size}`}>
      {initials}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function StudentProfile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;

  const [profile, setProfile] = useState(null);
  const [editData, setEditData] = useState({});
  const [fines, setFines] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [activeTab, setActiveTab] = useState("info");

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const removeToast = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  useEffect(() => {
    if (!userId) { setPageLoading(false); return; }

    const load = async () => {
      try {
        const [profileRes, finesRes, borrowRes] = await Promise.all([
          axios.get(`${API}/users/${userId}`),
          axios.get(`${API}/fines`, { params: { user_id: userId } }),
          axios.get(`${API}/borrowing`, { params: { user_id: userId } }),
        ]);
        setProfile(profileRes.data);
        setEditData(profileRes.data);
        setFines(Array.isArray(finesRes.data) ? finesRes.data : []);
        setBorrows(Array.isArray(borrowRes.data) ? borrowRes.data : []);
      } catch {
        addToast("Failed to load profile data.", "error");
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, [userId, addToast]);

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      await axios.put(`${API}/users/${userId}`, {
        first_name: editData.first_name,
        last_name: editData.last_name,
        email: editData.email,
        department: editData.department,
        is_active: profile.is_active,
      });
      setProfile({ ...profile, ...editData });
      setIsEditing(false);
      setShowSaveModal(false);
      addToast("Profile updated successfully!", "success");
    } catch {
      addToast("Failed to save profile. Try again.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(profile);
    setIsEditing(false);
  };

  // Stats
  const activeBorrows = borrows.filter((b) => b.status !== "Returned").length;
  const pendingFines = fines.filter((f) => f.status === "pending");
  const totalOutstanding = pendingFines.reduce((s, f) => s + parseFloat(f.amount || 0), 0);

  if (pageLoading) {
    return (
      <DashboardLayout userRole="student">
        <div className="spb-loading-full">
          <div className="spb-loading-spin" />
          <p>Loading your profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout userRole="student">
        <div className="spb-error-full">
          <div className="spb-error-icon">⚠️</div>
          <h3>Profile Not Found</h3>
          <p>Please log in again to access your profile.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="student">
      <div className="spb-root">

        {/* ══ HERO ════════════════════════════════════════ */}
        <div className="spb-hero">
          <div className="spb-hero-blob spb-hero-blob--1" />
          <div className="spb-hero-blob spb-hero-blob--2" />

          <div className="spb-hero-inner">
            {/* Profile identity */}
            <div className="spb-hero-identity">
              <div className="spb-avatar-wrap">
                <Avatar firstName={profile.first_name} lastName={profile.last_name} size="hero" />
                <div className={`spb-avatar-status ${profile.is_active ? "spb-avatar-status--active" : "spb-avatar-status--blocked"}`} />
              </div>
              <div className="spb-hero-info">
                <div className="spb-hero-eyebrow">👤 Student Profile</div>
                <h1 className="spb-hero-title">
                  {profile.first_name} <em className="spb-hero-em">{profile.last_name}</em>
                </h1>
                <div className="spb-hero-meta">
                  <span>✉️ {profile.email}</span>
                  {profile.department && <span>🏛 {profile.department}</span>}
                  <span className={`spb-hero-badge ${profile.is_active ? "spb-hero-badge--active" : "spb-hero-badge--blocked"}`}>
                    {profile.is_active ? "● Active" : "✕ Blocked"}
                  </span>
                </div>
              </div>
            </div>

            {/* Stat chips */}
            <div className="spb-hero-chips">
              {[
                { icon: "📚", num: activeBorrows, label: "Active Borrows", cls: "chip--blue"  },
                { icon: "⚠️", num: pendingFines.length, label: "Unpaid Fines", cls: "chip--red" },
                { icon: "💸", val: `Rs.${totalOutstanding.toFixed(0)}`, label: "Outstanding", cls: "chip--amber" },
                { icon: "📅", val: fmtDate(profile.created_at), label: "Member Since", cls: "chip--green" },
              ].map((c) => (
                <div key={c.label} className={`spb-chip ${c.cls}`}>
                  <span className="spb-chip-icon">{c.icon}</span>
                  <span className="spb-chip-num">{c.val ?? c.num}</span>
                  <span className="spb-chip-label">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ TABS ════════════════════════════════════════ */}
        <div className="spb-tabs-wrap">
          <div className="spb-tabs">
            {[
              { key: "info",    label: "Personal Info",   icon: "👤" },
              { key: "academic", label: "Academic Info",  icon: "🎓" },
              { key: "fines",   label: "Fines",           icon: "💰", count: pendingFines.length },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`spb-tab ${activeTab === tab.key ? "spb-tab--active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {tab.count > 0 && (
                  <span className={`spb-tab-badge ${activeTab === tab.key ? "spb-tab-badge--active" : ""}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ══ CONTENT ══════════════════════════════════════ */}
        <div className="spb-content">

          {/* ── PERSONAL INFO TAB ── */}
          {activeTab === "info" && (
            <div className="spb-section spb-section--form">
              <div className="spb-section-header">
                <div>
                  <h2 className="spb-section-title">Personal Information</h2>
                  <p className="spb-section-sub">Your name, email, and department details</p>
                </div>
                {!isEditing && (
                  <button className="spb-edit-btn" onClick={() => setIsEditing(true)}>
                    ✏️ Edit Profile
                  </button>
                )}
              </div>

              <div className="spb-form-grid">
                <div className="spb-field">
                  <label className="spb-label">First Name</label>
                  {isEditing ? (
                    <input
                      className="spb-input"
                      type="text"
                      value={editData.first_name || ""}
                      onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                      placeholder="First name"
                    />
                  ) : (
                    <div className="spb-field-val">{profile.first_name || "—"}</div>
                  )}
                </div>

                <div className="spb-field">
                  <label className="spb-label">Last Name</label>
                  {isEditing ? (
                    <input
                      className="spb-input"
                      type="text"
                      value={editData.last_name || ""}
                      onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                      placeholder="Last name"
                    />
                  ) : (
                    <div className="spb-field-val">{profile.last_name || "—"}</div>
                  )}
                </div>

                <div className="spb-field spb-field--full">
                  <label className="spb-label">Email Address</label>
                  {isEditing ? (
                    <input
                      className="spb-input"
                      type="email"
                      value={editData.email || ""}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  ) : (
                    <div className="spb-field-val">{profile.email || "—"}</div>
                  )}
                </div>

                <div className="spb-field spb-field--full">
                  <label className="spb-label">Department</label>
                  {isEditing ? (
                    <input
                      className="spb-input"
                      type="text"
                      value={editData.department || ""}
                      onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                      placeholder="e.g. Computer Science"
                    />
                  ) : (
                    <div className="spb-field-val">{profile.department || "—"}</div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="spb-form-actions">
                  <button className="spb-btn-ghost" onClick={handleCancel}>
                    ✕ Cancel
                  </button>
                  <button className="spb-btn-primary" onClick={() => setShowSaveModal(true)}>
                    ✅ Save Changes
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── ACADEMIC INFO TAB ── */}
          {activeTab === "academic" && (
            <div className="spb-section">
              <div className="spb-section-header">
                <div>
                  <h2 className="spb-section-title">Academic Information</h2>
                  <p className="spb-section-sub">Your enrollment and membership details</p>
                </div>
              </div>

              <div className="spb-info-grid">
                {[
                  { icon: "🪪", label: "Student ID",       val: profile.id              },
                  { icon: "🏛",  label: "Department",       val: profile.department || "—" },
                  { icon: "👤", label: "Full Name",        val: `${profile.first_name} ${profile.last_name}` },
                  { icon: "✉️", label: "Email",            val: profile.email           },
                  { icon: "📅", label: "Enrolled On",      val: fmtDate(profile.created_at) },
                  { icon: "🔖", label: "Role",             val: profile.role || "Student" },
                  { icon: "📚", label: "Active Borrows",   val: activeBorrows           },
                  { icon: "⚠️", label: "Pending Fines",    val: pendingFines.length     },
                ].map((item) => (
                  <div key={item.label} className="spb-info-card">
                    <div className="spb-info-icon">{item.icon}</div>
                    <div className="spb-info-text">
                      <span className="spb-info-label">{item.label}</span>
                      <span className="spb-info-val">{item.val}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="spb-membership-card">
                <div className="spb-membership-left">
                  <div className="spb-membership-icon">🎓</div>
                  <div>
                    <div className="spb-membership-title">Membership Status</div>
                    <div className="spb-membership-sub">Library access level</div>
                  </div>
                </div>
                <span className={`spb-membership-badge ${profile.is_active ? "spb-membership-badge--active" : "spb-membership-badge--blocked"}`}>
                  {profile.is_active ? "✓ Active Member" : "✕ Account Blocked"}
                </span>
              </div>
            </div>
          )}

          {/* ── FINES TAB ── */}
          {activeTab === "fines" && (
            <div className="spb-section">
              <div className="spb-section-header">
                <div>
                  <h2 className="spb-section-title">Fine History</h2>
                  <p className="spb-section-sub">Overview of your library fines</p>
                </div>
                {totalOutstanding > 0 && (
                  <div className="spb-fines-outstanding">
                    <span className="spb-fines-outstanding-label">Total Outstanding</span>
                    <span className="spb-fines-outstanding-val">{fmtCurrency(totalOutstanding)}</span>
                  </div>
                )}
              </div>

              {fines.length === 0 ? (
                <div className="spb-empty">
                  <div className="spb-empty-icon">🎉</div>
                  <h3>No fines on your account!</h3>
                  <p>Keep returning books on time to stay fine-free.</p>
                </div>
              ) : (
                <div className="spb-fines-list">
                  {fines.map((fine) => {
                    const isPending = fine.status === "pending";
                    const isPaid = fine.status === "paid";
                    const isWaived = fine.status === "waived";
                    const statusColor = isPaid ? "#22c55e" : isWaived ? "#a78bfa" : "#ef4444";
                    const statusClass = isPaid ? "paid" : isWaived ? "waived" : "pending";
                    return (
                      <div key={fine.id} className={`spb-fine-row spb-fine-row--${statusClass}`}>
                        <div className="spb-fine-row-bar" style={{ background: statusColor }} />
                        <div className="spb-fine-book">
                          <div className="spb-fine-book-icon">📚</div>
                          <div>
                            <div className="spb-fine-book-title">{fine.book_title || "N/A"}</div>
                            <div className="spb-fine-book-reason">{fine.reason || "Overdue fine"}</div>
                          </div>
                        </div>
                        <div className="spb-fine-meta">
                          <span className="spb-fine-date">{fmtDate(fine.created_at)}</span>
                          {fine.days_overdue > 0 && (
                            <span className="spb-fine-days">{fine.days_overdue}d overdue</span>
                          )}
                        </div>
                        <div className="spb-fine-amount" style={{ color: statusColor }}>
                          {fmtCurrency(fine.amount)}
                        </div>
                        <span className={`spb-fine-status spb-fine-status--${statusClass}`}>
                          {isPaid ? "✓ Paid" : isWaived ? "◎ Waived" : "⚠ Unpaid"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {showSaveModal && (
        <SaveModal
          onClose={() => !saveLoading && setShowSaveModal(false)}
          onConfirm={handleSave}
          loading={saveLoading}
        />
      )}

      <Toast toasts={toasts} remove={removeToast} />
    </DashboardLayout>
  );
}