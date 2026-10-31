import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import axios from "axios";
import "../styles/StudentFines.css";

const API = "http://localhost:5000";

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtCurrency = (amount) => `Rs. ${parseFloat(amount || 0).toFixed(2)}`;

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="sfb-toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`sfb-toast sfb-toast--${t.type}`}>
          <span className="sfb-toast-icon">
            {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}
          </span>
          <span className="sfb-toast-msg">{t.message}</span>
          <button className="sfb-toast-x" onClick={() => remove(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ── Pay Confirm Modal ─────────────────────────────────────────────────────────
function PayModal({ fine, onClose, onConfirm, loading }) {
  return (
    <div className="sfb-backdrop" onClick={onClose}>
      <div className="sfb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sfb-modal-top">
          <div className="sfb-modal-icon sfb-modal-icon--pay">💳</div>
          <div>
            <h3 className="sfb-modal-title">Pay Fine</h3>
            <p className="sfb-modal-sub">Confirm payment for this fine</p>
          </div>
          <button className="sfb-modal-x" onClick={onClose}>✕</button>
        </div>

        <div className="sfb-modal-fine-row">
          <div className="sfb-modal-fine-info">
            <div className="sfb-modal-fine-book">
              <span className="sfb-modal-fine-icon">📚</span>
              <div>
                <h4>{fine.book_title || "N/A"}</h4>
                <p>Fine #{fine.id} · {fine.reason || "Overdue fine"}</p>
              </div>
            </div>
            <div className="sfb-modal-fine-amount-badge">
              {fmtCurrency(fine.amount)}
            </div>
          </div>
        </div>

        {fine.days_overdue > 0 && (
          <div className="sfb-modal-detail-row">
            <div className="sfb-modal-detail-item">
              <span className="sfb-modal-detail-label">Days Overdue</span>
              <span className="sfb-modal-detail-val" style={{ color: "#ef4444" }}>{fine.days_overdue} days</span>
            </div>
            <div className="sfb-modal-detail-sep" />
            <div className="sfb-modal-detail-item">
              <span className="sfb-modal-detail-label">Fine Created</span>
              <span className="sfb-modal-detail-val">{fmtDate(fine.created_at)}</span>
            </div>
          </div>
        )}

        <div className="sfb-modal-notice">
          ℹ️ Once paid, this fine will be moved to your payment history and cannot be undone.
        </div>

        <div className="sfb-modal-footer">
          <button className="sfb-btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="sfb-btn-primary" onClick={onConfirm} disabled={loading}>
            {loading ? <><span className="sfb-spinner-sm" /> Processing...</> : "💳 Confirm Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Fine Card ─────────────────────────────────────────────────────────────────
function FineCard({ fine, idx, onPay }) {
  const isPending = fine.status === "pending";
  const isPaid = fine.status === "paid";
  const isWaived = fine.status === "waived";

  const statusColor = isPaid ? "#22c55e"
    : isWaived ? "#a78bfa"
    : "#ef4444";

  const statusClass = isPaid ? "paid"
    : isWaived ? "waived"
    : "pending";

  const statusText = isPaid ? "✓ Paid"
    : isWaived ? "◎ Waived"
    : "⚠ Unpaid";

  return (
    <div
      className={`sfb-card sfb-card--${statusClass}`}
      style={{ animationDelay: `${Math.min(idx * 0.06, 0.5)}s` }}
    >
      <div className="sfb-card-bar" style={{ background: statusColor }} />

      <div className="sfb-card-body">
        <div className="sfb-card-top-row">
          <div className="sfb-card-book-icon">📚</div>
          <div className="sfb-card-book-info">
            <h3 className="sfb-card-title">{fine.book_title || "N/A"}</h3>
            <p className="sfb-card-reason">{fine.reason || "Overdue fine"}</p>
          </div>
          <div className="sfb-card-amount" style={{ color: statusColor }}>
            {fmtCurrency(fine.amount)}
          </div>
        </div>

        <div className="sfb-card-status-row">
          <span className={`sfb-card-status sfb-card-status--${statusClass}`}>
            {statusText}
          </span>
          <span className="sfb-card-id">Fine #{fine.id}</span>
        </div>

        <div className="sfb-card-dates">
          <div className="sfb-card-date-item">
            <span className="sfb-card-date-label">Issued On</span>
            <span className="sfb-card-date-val">{fmtDate(fine.created_at)}</span>
          </div>
          {fine.days_overdue > 0 && (
            <>
              <div className="sfb-card-date-sep" />
              <div className="sfb-card-date-item">
                <span className="sfb-card-date-label">Days Overdue</span>
                <span className="sfb-card-date-val" style={{ color: "#ef4444" }}>{fine.days_overdue}d</span>
              </div>
            </>
          )}
          {isPaid && fine.payment_date && (
            <>
              <div className="sfb-card-date-sep" />
              <div className="sfb-card-date-item">
                <span className="sfb-card-date-label">Paid On</span>
                <span className="sfb-card-date-val" style={{ color: "#22c55e" }}>{fmtDate(fine.payment_date)}</span>
              </div>
            </>
          )}
        </div>

        {isPending && (
          <div className="sfb-card-days-pill">
            ⚠️ Payment required — {fmtCurrency(fine.amount)} outstanding
          </div>
        )}
        {isWaived && (
          <div className="sfb-card-days-pill sfb-card-days-pill--waived">
            ◎ This fine has been waived by the librarian
          </div>
        )}
      </div>

      <div className="sfb-card-footer">
        {isPending && (
          <button className="sfb-card-btn sfb-card-btn--pay" onClick={() => onPay(fine)}>
            💳 Pay Now
          </button>
        )}
        {isPaid && (
          <div className="sfb-card-note sfb-card-note--paid">✓ Payment complete</div>
        )}
        {isWaived && (
          <div className="sfb-card-note sfb-card-note--waived">◎ Fine waived</div>
        )}
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function StudentFines() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;

  const [fines, setFines] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [payModal, setPayModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const removeToast = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  const fetchFines = useCallback(async () => {
    if (!userId) return;
    setPageLoading(true);
    try {
      const res = await axios.get(`${API}/fines`, { params: { user_id: userId } });
      setFines(Array.isArray(res.data) ? res.data : []);
    } catch {
      addToast("Failed to load fines.", "error");
    } finally {
      setPageLoading(false);
    }
  }, [userId, addToast]);

  useEffect(() => { fetchFines(); }, [fetchFines]);

  // ── Pay ──
  const handlePay = async () => {
    if (!payModal) return;
    setActionLoading(true);
    try {
      await axios.patch(`${API}/fines/${payModal.id}/pay`);
      setFines((prev) =>
        prev.map((f) =>
          f.id === payModal.id
            ? { ...f, status: "paid", payment_date: new Date().toISOString() }
            : f
        )
      );
      addToast(`Fine of ${fmtCurrency(payModal.amount)} paid successfully!`, "success");
      setPayModal(null);
    } catch (err) {
      addToast(err.response?.data?.message || "Payment failed. Check server.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Stats ──
  const pendingFines = fines.filter((f) => f.status === "pending");
  const paidFines = fines.filter((f) => f.status === "paid");
  const waivedFines = fines.filter((f) => f.status === "waived");
  const totalOutstanding = pendingFines.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);
  const totalPaid = paidFines.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);

  const displayed = fines.filter((f) => {
    if (filter === "pending") return f.status === "pending";
    if (filter === "paid")    return f.status === "paid";
    if (filter === "waived")  return f.status === "waived";
    return true;
  });

  return (
    <DashboardLayout userRole="student">
      <div className="sfb-root">

        {/* ══ HERO ════════════════════════════════════════ */}
        <div className="sfb-hero">
          <div className="sfb-hero-blob sfb-hero-blob--1" />
          <div className="sfb-hero-blob sfb-hero-blob--2" />

          <div className="sfb-hero-inner">
            <div className="sfb-hero-left">
              <div className="sfb-hero-eyebrow">💰 My Library</div>
              <h1 className="sfb-hero-title">
                Library <em className="sfb-hero-em">Fines</em>
              </h1>
              <p className="sfb-hero-desc">
                View and settle your outstanding fines. Keep your account clear to borrow more books.
              </p>
            </div>

            <div className="sfb-hero-chips">
              {[
                { icon: "⚠️", num: pendingFines.length, label: "Unpaid",  cls: "chip--red"    },
                { icon: "💸", val: `Rs.${totalOutstanding.toFixed(0)}`, label: "Outstanding", cls: "chip--amber" },
                { icon: "✅", num: paidFines.length,    label: "Paid",    cls: "chip--green"  },
                { icon: "◎",  num: waivedFines.length,  label: "Waived",  cls: "chip--purple" },
              ].map((c) => (
                <div key={c.label} className={`sfb-chip ${c.cls}`}>
                  <span className="sfb-chip-icon">{c.icon}</span>
                  <span className="sfb-chip-num">{c.val ?? c.num}</span>
                  <span className="sfb-chip-label">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ OUTSTANDING ALERT ═══════════════════════════ */}
        {pendingFines.length > 0 && (
          <div className="sfb-alert-pending">
            <span className="sfb-alert-icon">⚠️</span>
            <div>
              <strong>Outstanding Fines — Payment Required</strong>
              <p>
                You have {pendingFines.length} unpaid fine{pendingFines.length > 1 ? "s" : ""} totalling{" "}
                <strong>{fmtCurrency(totalOutstanding)}</strong>. Please settle them to avoid borrowing restrictions.
              </p>
            </div>
          </div>
        )}

        {/* ══ ALL CLEAR ═══════════════════════════════════ */}
        {fines.length > 0 && pendingFines.length === 0 && (
          <div className="sfb-alert-clear">
            <span className="sfb-alert-icon">🎉</span>
            <div>
              <strong>Account in Good Standing!</strong>
              <p>You have no outstanding fines. Keep returning books on time to stay fine-free.</p>
            </div>
          </div>
        )}

        {/* ══ SUMMARY BAR ═════════════════════════════════ */}
        {fines.length > 0 && (
          <div className="sfb-summary-bar">
            <div className="sfb-summary-item">
              <span className="sfb-summary-label">Total Outstanding</span>
              <span className="sfb-summary-val sfb-summary-val--red">{fmtCurrency(totalOutstanding)}</span>
            </div>
            <div className="sfb-summary-divider" />
            <div className="sfb-summary-item">
              <span className="sfb-summary-label">Total Paid</span>
              <span className="sfb-summary-val sfb-summary-val--green">{fmtCurrency(totalPaid)}</span>
            </div>
            <div className="sfb-summary-divider" />
            <div className="sfb-summary-item">
              <span className="sfb-summary-label">All Time Fines</span>
              <span className="sfb-summary-val">{fines.length}</span>
            </div>
          </div>
        )}

        {/* ══ FILTER TABS ═════════════════════════════════ */}
        <div className="sfb-tabs-wrap">
          <div className="sfb-tabs">
            {[
              { key: "all",     label: "All Fines", count: fines.length          },
              { key: "pending", label: "Unpaid",    count: pendingFines.length   },
              { key: "paid",    label: "Paid",      count: paidFines.length      },
              { key: "waived",  label: "Waived",    count: waivedFines.length    },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`sfb-tab ${filter === tab.key ? "sfb-tab--active" : ""}`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`sfb-tab-badge ${filter === tab.key ? "sfb-tab-badge--active" : ""}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ══ CONTENT ══════════════════════════════════════ */}
        <div className="sfb-content">
          {pageLoading && (
            <div className="sfb-loading">
              <div className="sfb-loading-spin" />
              <p>Loading your fines...</p>
            </div>
          )}

          {!pageLoading && displayed.length === 0 && (
            <div className="sfb-empty">
              <div className="sfb-empty-icon">
                {filter === "all" ? "🎉" : filter === "pending" ? "✅" : "📋"}
              </div>
              <h3>
                {filter === "all"     ? "No fines on your account"
                : filter === "pending" ? "No outstanding fines — great job!"
                : filter === "paid"    ? "No paid fines yet"
                : "No waived fines"}
              </h3>
              <p>
                {filter === "all"
                  ? "Return your books on time to stay fine-free."
                  : "Switch filter to see other records."}
              </p>
              {filter !== "all" && (
                <button className="sfb-empty-btn" onClick={() => setFilter("all")}>
                  View All Fines
                </button>
              )}
            </div>
          )}

          {!pageLoading && displayed.length > 0 && (
            <div className="sfb-grid">
              {displayed.map((fine, i) => (
                <FineCard
                  key={fine.id}
                  fine={fine}
                  idx={i}
                  onPay={() => setPayModal(fine)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {payModal && (
        <PayModal
          fine={payModal}
          onClose={() => !actionLoading && setPayModal(null)}
          onConfirm={handlePay}
          loading={actionLoading}
        />
      )}

      <Toast toasts={toasts} remove={removeToast} />
    </DashboardLayout>
  );
}