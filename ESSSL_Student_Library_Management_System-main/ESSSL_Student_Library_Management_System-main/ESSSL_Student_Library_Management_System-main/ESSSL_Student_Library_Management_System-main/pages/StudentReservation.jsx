import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
import "../styles/StudentReservation.css";

const API = "http://localhost:5000";

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const calcDaysUntilDeadline = (deadlineDateStr) => {
  if (!deadlineDateStr) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const deadline = new Date(deadlineDateStr); deadline.setHours(0, 0, 0, 0);
  return Math.ceil((deadline - today) / 86400000);
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="srb-toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`srb-toast srb-toast--${t.type}`}>
          <span className="srb-toast-icon">
            {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}
          </span>
          <span className="srb-toast-msg">{t.message}</span>
          <button className="srb-toast-x" onClick={() => remove(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ── Cancel Confirm Modal ──────────────────────────────────────────────────────
function CancelModal({ reservation, onClose, onConfirm, loading }) {
  return (
    <div className="srb-backdrop" onClick={onClose}>
      <div className="srb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="srb-modal-top">
          <div className="srb-modal-icon srb-modal-icon--cancel">🗑️</div>
          <div>
            <h3 className="srb-modal-title">Cancel Reservation</h3>
            <p className="srb-modal-sub">This action cannot be undone</p>
          </div>
          <button className="srb-modal-x" onClick={onClose}>✕</button>
        </div>

        <div className="srb-modal-book-row">
          <div className="srb-modal-thumb">
            {reservation.cover_image
              ? <img src={`${API}/uploads/${reservation.cover_image}`} alt={reservation.book_title} />
              : <div className="srb-modal-thumb-ph">📗</div>}
          </div>
          <div className="srb-modal-book-info">
            <h4>{reservation.book_title}</h4>
            <p>by {reservation.author || "Unknown Author"}</p>
            <div className="srb-modal-meta-row">
              <span>📅 Reserved: <strong>{fmtDate(reservation.reservation_date)}</strong></span>
            </div>
          </div>
        </div>

        <div className="srb-modal-warning">
          ⚠️ Cancelling this reservation will remove you from the queue. If others are waiting, you may lose your position.
        </div>

        <div className="srb-modal-footer">
          <button className="srb-btn-ghost" onClick={onClose} disabled={loading}>Keep Reservation</button>
          <button className="srb-btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <><span className="srb-spinner-sm" /> Cancelling...</> : "🗑️ Yes, Cancel It"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pickup Confirm Modal ──────────────────────────────────────────────────────
function PickupModal({ reservation, onClose, onConfirm, loading }) {
  const days = calcDaysUntilDeadline(reservation.pickup_deadline);
  return (
    <div className="srb-backdrop" onClick={onClose}>
      <div className="srb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="srb-modal-top">
          <div className="srb-modal-icon srb-modal-icon--pickup">🏷️</div>
          <div>
            <h3 className="srb-modal-title">Confirm Pickup</h3>
            <p className="srb-modal-sub">Mark this book as picked up</p>
          </div>
          <button className="srb-modal-x" onClick={onClose}>✕</button>
        </div>

        <div className="srb-modal-book-row">
          <div className="srb-modal-thumb">
            {reservation.cover_image
              ? <img src={`${API}/uploads/${reservation.cover_image}`} alt={reservation.book_title} />
              : <div className="srb-modal-thumb-ph">📗</div>}
          </div>
          <div className="srb-modal-book-info">
            <h4>{reservation.book_title}</h4>
            <p>by {reservation.author || "Unknown Author"}</p>
            <div className="srb-modal-meta-row">
              <span>⏰ Pickup Deadline: <strong>{fmtDate(reservation.pickup_deadline)}</strong></span>
              {days !== null && (
                <span style={{ color: days < 0 ? "#ef4444" : days <= 2 ? "#f59e0b" : "#22c55e" }}>
                  {days < 0 ? `⚠️ Expired ${Math.abs(days)}d ago` : `✓ ${days} days left`}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="srb-modal-notice">
          ℹ️ Confirming pickup will convert this reservation into an active borrow. The standard borrowing period of <strong>14 days</strong> will apply.
        </div>

        <div className="srb-modal-footer">
          <button className="srb-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="srb-btn-primary" onClick={onConfirm} disabled={loading}>
            {loading ? <><span className="srb-spinner-sm" /> Processing...</> : "🏷️ Confirm Pickup"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reservation Card ──────────────────────────────────────────────────────────
function ReservationCard({ reservation, idx, onCancel, onPickup }) {
  const isReady = reservation.status === "ready";
  const isWaiting = reservation.status === "waiting";
  const isCancelled = reservation.status === "cancelled";
  const isPickedUp = reservation.status === "pickedup";

  const days = isReady ? calcDaysUntilDeadline(reservation.pickup_deadline) : null;
  const isExpired = days !== null && days < 0;
  const isDueSoon = days !== null && days >= 0 && days <= 2;

  const statusColor = isCancelled ? "#94a3b8"
    : isPickedUp ? "#22c55e"
    : isExpired ? "#ef4444"
    : isDueSoon ? "#f59e0b"
    : isReady ? "#6366f1"
    : "#0ea5e9";

  const statusClass = isCancelled ? "cancelled"
    : isPickedUp ? "pickedup"
    : isExpired ? "expired"
    : isDueSoon ? "due-soon"
    : isReady ? "ready"
    : "waiting";

  const statusLabel = isCancelled ? "Cancelled"
    : isPickedUp ? "Picked Up"
    : isExpired ? "Expired"
    : isDueSoon ? `${days}d left`
    : isReady ? "Ready"
    : "Waiting";

  const statusText = isCancelled ? "✕ Cancelled"
    : isPickedUp ? "✓ Picked Up"
    : isExpired ? "⚠ Expired"
    : isDueSoon ? "⏰ Pickup Soon"
    : isReady ? "● Ready"
    : "⌛ Waiting";

  return (
    <div
      className={`srb-card srb-card--${statusClass}`}
      style={{ animationDelay: `${Math.min(idx * 0.06, 0.5)}s` }}
    >
      <div className="srb-card-bar" style={{ background: statusColor }} />

      <div className="srb-card-cover">
        {reservation.cover_image
          ? <img src={`${API}/uploads/${reservation.cover_image}`} alt={reservation.book_title} />
          : <div className="srb-card-cover-ph">📗</div>}
      </div>

      <div className="srb-card-body">
        <div className="srb-card-status-row">
          <span className={`srb-card-status srb-card-status--${statusClass}`}>
            {statusText}
          </span>
          <span className="srb-card-id">#{reservation.id}</span>
        </div>

        <h3 className="srb-card-title">{reservation.book_title}</h3>
        <p className="srb-card-author">by {reservation.author || "Unknown Author"}</p>

        <div className="srb-card-dates">
          <div className="srb-card-date-item">
            <span className="srb-card-date-label">Reserved On</span>
            <span className="srb-card-date-val">{fmtDate(reservation.reservation_date)}</span>
          </div>
          {isReady && reservation.pickup_deadline && (
            <>
              <div className="srb-card-date-sep" />
              <div className="srb-card-date-item">
                <span className="srb-card-date-label">Pickup Deadline</span>
                <span className="srb-card-date-val" style={{ color: isExpired ? "#ef4444" : "inherit" }}>
                  {fmtDate(reservation.pickup_deadline)}
                </span>
              </div>
            </>
          )}
          {isWaiting && reservation.queue_position && (
            <>
              <div className="srb-card-date-sep" />
              <div className="srb-card-date-item">
                <span className="srb-card-date-label">Queue Position</span>
                <span className="srb-card-date-val">#{reservation.queue_position}</span>
              </div>
            </>
          )}
        </div>

        {isReady && days !== null && (
          <div className="srb-card-days-pill" style={{ background: statusColor + "14", color: statusColor }}>
            {isExpired
              ? `⚠️ Pickup deadline passed ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} ago`
              : `⏰ ${days} day${days !== 1 ? "s" : ""} left to pick up`}
          </div>
        )}

        {isWaiting && (
          <div className="srb-card-days-pill" style={{ background: "#0ea5e914", color: "#0ea5e9" }}>
            ⌛ You are in the waiting queue
          </div>
        )}
      </div>

      <div className="srb-card-footer">
        {(isReady || isWaiting) && (
          <>
            {isReady && !isExpired && (
              <button className="srb-card-btn srb-card-btn--pickup" onClick={() => onPickup(reservation)}>
                🏷️ Pickup
              </button>
            )}
            <button className="srb-card-btn srb-card-btn--cancel" onClick={() => onCancel(reservation)}>
              🗑️ Cancel
            </button>
          </>
        )}
        {isCancelled && (
          <div className="srb-card-note srb-card-note--cancelled">✕ Reservation cancelled</div>
        )}
        {isPickedUp && (
          <div className="srb-card-note srb-card-note--pickedup">✓ Successfully picked up</div>
        )}
        {isExpired && (
          <div className="srb-card-note srb-card-note--expired">⚠ Pickup window has passed</div>
        )}
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function StudentReservations() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;

  const [reservations, setReservations] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [cancelModal, setCancelModal] = useState(null);
  const [pickupModal, setPickupModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const removeToast = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  const fetchReservations = useCallback(async () => {
    if (!userId) return;
    setPageLoading(true);
    try {
      const res = await axios.get(`${API}/reservations`, { params: { user_id: userId } });
      setReservations(Array.isArray(res.data) ? res.data : []);
    } catch {
      addToast("Failed to load reservations.", "error");
    } finally {
      setPageLoading(false);
    }
  }, [userId, addToast]);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  // ── Cancel ──
  const handleCancel = async () => {
    if (!cancelModal) return;
    setActionLoading(true);
    try {
      await axios.delete(`${API}/reservations/${cancelModal.id}`);
      setReservations((prev) =>
        prev.map((r) => r.id === cancelModal.id ? { ...r, status: "cancelled" } : r)
      );
      addToast(`Reservation for "${cancelModal.book_title}" cancelled.`, "info");
      setCancelModal(null);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to cancel reservation.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Pickup ──
  const handlePickup = async () => {
    if (!pickupModal) return;
    setActionLoading(true);
    try {
      const res = await axios.patch(`${API}/reservations/${pickupModal.id}/pickup`);
      if (res.data.success) {
        setReservations((prev) =>
          prev.map((r) => r.id === pickupModal.id ? { ...r, status: "pickedup" } : r)
        );
        addToast(`"${pickupModal.book_title}" marked as picked up!`, "success");
        setPickupModal(null);
      } else {
        addToast(res.data.message || "Pickup failed.", "error");
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Pickup failed. Check server.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Stats ──
  const readyBks = reservations.filter((r) => r.status === "ready");
  const waitingBks = reservations.filter((r) => r.status === "waiting");
  const expiredBks = readyBks.filter((r) => calcDaysUntilDeadline(r.pickup_deadline) < 0);
  const pickupSoonBks = readyBks.filter((r) => {
    const d = calcDaysUntilDeadline(r.pickup_deadline);
    return d >= 0 && d <= 2;
  });

  const displayed = reservations.filter((r) => {
    if (filter === "ready") return r.status === "ready";
    if (filter === "waiting") return r.status === "waiting";
    if (filter === "done") return r.status === "cancelled" || r.status === "pickedup";
    return true;
  });

  return (
    <DashboardLayout userRole="student">
      <div className="srb-root">

        {/* ══ HERO ════════════════════════════════════════ */}
        <div className="srb-hero">
          <div className="srb-hero-blob srb-hero-blob--1" />
          <div className="srb-hero-blob srb-hero-blob--2" />

          <div className="srb-hero-inner">
            <div className="srb-hero-left">
              <div className="srb-hero-eyebrow">🔖 My Library</div>
              <h1 className="srb-hero-title">
                Book <em className="srb-hero-em">Reservations</em>
              </h1>
              <p className="srb-hero-desc">
                Track your reserved books, monitor your queue position, and pick up on time.
              </p>
            </div>

            <div className="srb-hero-chips">
              {[
                { icon: "✅", num: readyBks.length, label: "Ready", cls: "chip--green" },
                { icon: "⌛", num: waitingBks.length, label: "Waiting", cls: "chip--blue" },
                { icon: "⏰", num: pickupSoonBks.length, label: "Due Soon", cls: "chip--amber" },
                { icon: "⚠️", num: expiredBks.length, label: "Expired", cls: "chip--red" },
              ].map((c) => (
                <div key={c.label} className={`srb-chip ${c.cls}`}>
                  <span className="srb-chip-icon">{c.icon}</span>
                  <span className="srb-chip-num">{c.num}</span>
                  <span className="srb-chip-label">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ READY ALERT ══════════════════════════════════ */}
        {readyBks.length > 0 && expiredBks.length === 0 && (
          <div className="srb-alert-ready">
            <span className="srb-alert-icon">✅</span>
            <div>
              <strong>Books Ready for Pickup!</strong>
              <p>You have {readyBks.length} book{readyBks.length > 1 ? "s" : ""} waiting at the library. Visit the library to pick them up before the deadline.</p>
            </div>
          </div>
        )}

        {/* ══ EXPIRED ALERT ════════════════════════════════ */}
        {expiredBks.length > 0 && (
          <div className="srb-alert-expired">
            <span className="srb-alert-icon">⚠️</span>
            <div>
              <strong>Pickup Deadline Passed — Action Required</strong>
              <p>You have {expiredBks.length} reservation{expiredBks.length > 1 ? "s" : ""} past the pickup deadline. Please contact the library to resolve this.</p>
            </div>
          </div>
        )}

        {/* ══ FILTER TABS ═════════════════════════════════ */}
        <div className="srb-tabs-wrap">
          <div className="srb-tabs">
            {[
              { key: "all", label: "All", count: reservations.length },
              { key: "ready", label: "Ready", count: readyBks.length },
              { key: "waiting", label: "Waiting", count: waitingBks.length },
              { key: "done", label: "Closed", count: reservations.filter(r => r.status === "cancelled" || r.status === "pickedup").length },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`srb-tab ${filter === tab.key ? "srb-tab--active" : ""}`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`srb-tab-badge ${filter === tab.key ? "srb-tab-badge--active" : ""}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ══ CONTENT ══════════════════════════════════════ */}
        <div className="srb-content">
          {pageLoading && (
            <div className="srb-loading">
              <div className="srb-loading-spin" />
              <p>Loading your reservations...</p>
            </div>
          )}

          {!pageLoading && displayed.length === 0 && (
            <div className="srb-empty">
              <div className="srb-empty-icon">
                {filter === "all" ? "🔖" : filter === "ready" ? "⏳" : filter === "waiting" ? "✅" : "📭"}
              </div>
              <h3>
                {filter === "all" ? "No reservations yet"
                  : filter === "ready" ? "No books ready for pickup"
                  : filter === "waiting" ? "Not in any queue"
                  : "No closed reservations"}
              </h3>
              <p>
                {filter === "all"
                  ? "Browse the Book Search to reserve a book."
                  : "Switch filter to see other records."}
              </p>
              {filter !== "all" && (
                <button className="srb-empty-btn" onClick={() => setFilter("all")}>
                  View All Reservations
                </button>
              )}
            </div>
          )}

          {!pageLoading && displayed.length > 0 && (
            <div className="srb-grid">
              {displayed.map((r, i) => (
                <ReservationCard
                  key={r.id}
                  reservation={r}
                  idx={i}
                  onCancel={() => setCancelModal(r)}
                  onPickup={() => setPickupModal(r)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {cancelModal && (
        <CancelModal
          reservation={cancelModal}
          onClose={() => !actionLoading && setCancelModal(null)}
          onConfirm={handleCancel}
          loading={actionLoading}
        />
      )}
      {pickupModal && (
        <PickupModal
          reservation={pickupModal}
          onClose={() => !actionLoading && setPickupModal(null)}
          onConfirm={handlePickup}
          loading={actionLoading}
        />
      )}

      <Toast toasts={toasts} remove={removeToast} />
    </DashboardLayout>
  );
}