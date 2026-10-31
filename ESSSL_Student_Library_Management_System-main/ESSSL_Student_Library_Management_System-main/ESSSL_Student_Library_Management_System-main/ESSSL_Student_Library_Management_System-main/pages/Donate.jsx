import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/Donate.css";

const PRESET_AMOUNTS = [250, 500, 1000, 2500, 5000];

const IMPACT = [
  { icon: "📚", amount: "Rs. 250",  label: "Buys 1 new book for the library"          },
  { icon: "🖊️", amount: "Rs. 500",  label: "Covers study materials for 5 students"    },
  { icon: "💻", amount: "Rs. 1,000", label: "Funds one month of digital subscriptions" },
  { icon: "🏛️", amount: "Rs. 2,500", label: "Helps maintain the reading room"          },
  { icon: "🎓", amount: "Rs. 5,000", label: "Sponsors a full student membership"        },
];

const DONORS = [
  { name: "Kavinda R.",   amount: "Rs. 2,500", ago: "2 days ago",  initials: "KR" },
  { name: "Amali P.",     amount: "Rs. 1,000", ago: "5 days ago",  initials: "AP" },
  { name: "Anonymous",    amount: "Rs. 500",   ago: "1 week ago",  initials: "??"  },
  { name: "Nuwan S.",     amount: "Rs. 5,000", ago: "2 weeks ago", initials: "NS" },
];

export default function Donate() {
  const [amount, setAmount] = useState("");
  const [preset, setPreset] = useState(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handlePreset = (val) => {
    setPreset(val);
    setAmount(String(val));
    setError("");
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setPreset(null);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = Number(amount);
    if (!amount || num <= 0) { setError("Please enter a valid donation amount."); return; }
    if (num < 50) { setError("Minimum donation amount is Rs. 50."); return; }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 1500);
  };

  const handleReset = () => {
    setSuccess(false);
    setAmount(""); setPreset(null);
    setName(""); setMessage(""); setAnonymous(false);
  };

  const donatedAmount = amount || "0";

  return (
    <DashboardLayout userRole="student">
      <div className="don-root">

        {/* ══ HERO ════════════════════════════════════════ */}
        <div className="don-hero">
          <div className="don-hero-blob don-hero-blob--1" />
          <div className="don-hero-blob don-hero-blob--2" />
          <div className="don-hero-inner">
            <div className="don-hero-eyebrow">❤️ Give Back</div>
            <h1 className="don-hero-title">
              Support Your <em className="don-hero-em">Library</em>
            </h1>
            <p className="don-hero-desc">
              Every donation — big or small — helps us purchase new books, upgrade digital resources,
              and create a better learning environment for every student.
            </p>
            <div className="don-hero-chips">
              <div className="don-chip">📚 10,000+ Books</div>
              <div className="don-chip">👥 2,500+ Students Served</div>
              <div className="don-chip">💚 100% Goes to Library</div>
            </div>
          </div>
        </div>

        {/* ══ MAIN GRID ═══════════════════════════════════ */}
        <div className="don-main">

          {/* ── LEFT: Donation form ── */}
          <div className="don-form-panel">
            <div className="don-panel-header">
              <div className="don-panel-icon">💝</div>
              <div>
                <h2 className="don-panel-title">Make a Donation</h2>
                <p className="don-panel-sub">Secure · Transparent · Impactful</p>
              </div>
            </div>

            {success ? (
              <div className="don-success">
                <div className="don-success-anim">🎉</div>
                <h3 className="don-success-title">Thank You!</h3>
                <p className="don-success-sub">
                  Your generous donation of <strong>Rs. {Number(donatedAmount).toLocaleString()}</strong> has been received.
                </p>
                <p className="don-success-desc">
                  Your contribution directly supports our library's mission to empower every student with knowledge.
                </p>
                <div className="don-success-badge">❤️ Donation Confirmed</div>
                <button className="don-again-btn" onClick={handleReset}>
                  Make Another Donation
                </button>
              </div>
            ) : (
              <form className="don-form" onSubmit={handleSubmit} noValidate>

                {/* Preset amounts */}
                <div className="don-field">
                  <label className="don-label">Quick Select Amount</label>
                  <div className="don-presets">
                    {PRESET_AMOUNTS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`don-preset-btn ${preset === p ? "don-preset-btn--active" : ""}`}
                        onClick={() => handlePreset(p)}
                      >
                        Rs. {p.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom amount */}
                <div className="don-field">
                  <label className="don-label">Custom Amount (Rs.) <span className="don-req">*</span></label>
                  <div className="don-amount-wrap">
                    <span className="don-amount-prefix">Rs.</span>
                    <input
                      className={`don-amount-input ${error ? "don-amount-input--error" : ""}`}
                      type="number"
                      min="50"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={handleAmountChange}
                    />
                  </div>
                  {error && <span className="don-error">{error}</span>}
                  <span className="don-hint">Minimum donation: Rs. 50</span>
                </div>

                {/* Donor name */}
                <div className="don-field">
                  <div className="don-name-row">
                    <label className="don-label">Your Name (optional)</label>
                    <label className="don-anon-toggle">
                      <input
                        type="checkbox"
                        checked={anonymous}
                        onChange={(e) => { setAnonymous(e.target.checked); if (e.target.checked) setName(""); }}
                      />
                      <span>Donate anonymously</span>
                    </label>
                  </div>
                  <input
                    className="don-input"
                    type="text"
                    placeholder="Your name (shown in recent donors)"
                    value={anonymous ? "" : name}
                    disabled={anonymous}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Message */}
                <div className="don-field">
                  <label className="don-label">Leave a Message (optional)</label>
                  <textarea
                    className="don-input don-textarea"
                    rows={3}
                    placeholder="Share why you're donating or a message for students..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                {/* Summary */}
                {amount && Number(amount) > 0 && (
                  <div className="don-summary">
                    <div className="don-summary-row">
                      <span>Donation Amount</span>
                      <span>Rs. {Number(amount).toLocaleString()}</span>
                    </div>
                    <div className="don-summary-row don-summary-row--total">
                      <span>Total</span>
                      <strong>Rs. {Number(amount).toLocaleString()}</strong>
                    </div>
                  </div>
                )}

                <button className="don-submit-btn" type="submit" disabled={submitting}>
                  {submitting
                    ? <><span className="don-spinner" /> Processing...</>
                    : <>❤️ Donate {amount && Number(amount) > 0 ? `Rs. ${Number(amount).toLocaleString()}` : "Now"}</>
                  }
                </button>

                <p className="don-secure-note">🔒 Your donation is secure and goes directly to library resources.</p>
              </form>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="don-right-col">

            {/* Impact card */}
            <div className="don-impact-card">
              <h3 className="don-impact-title">Your Impact</h3>
              <p className="don-impact-sub">See what your donation can achieve</p>
              <div className="don-impact-list">
                {IMPACT.map((item) => (
                  <div key={item.amount} className={`don-impact-row ${amount && Number(amount) >= parseInt(item.amount.replace(/\D/g,"")) ? "don-impact-row--active" : ""}`}>
                    <span className="don-impact-icon">{item.icon}</span>
                    <div className="don-impact-body">
                      <span className="don-impact-amt">{item.amount}</span>
                      <span className="don-impact-desc">{item.label}</span>
                    </div>
                    {amount && Number(amount) >= parseInt(item.amount.replace(/\D/g,"")) && (
                      <span className="don-impact-check">✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent donors */}
            <div className="don-donors-card">
              <h3 className="don-donors-title">💚 Recent Donors</h3>
              <div className="don-donors-list">
                {DONORS.map((d, i) => (
                  <div key={i} className="don-donor-row">
                    <div className="don-donor-avatar">{d.initials}</div>
                    <div className="don-donor-info">
                      <span className="don-donor-name">{d.name}</span>
                      <span className="don-donor-ago">{d.ago}</span>
                    </div>
                    <span className="don-donor-amount">{d.amount}</span>
                  </div>
                ))}
              </div>
              <div className="don-donors-footer">Be the next to make a difference ✨</div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}