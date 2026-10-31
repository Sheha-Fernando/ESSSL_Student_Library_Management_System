import { useState } from "react";
import { Mail, Phone, MapPin, Send, Clock, MessageSquare, CheckCircle } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/ContactUs.css";

const FAQS = [
  { q: "How do I renew a borrowed book?",       a: "Go to My Borrowings, click Renew on any active borrow. Each book can be renewed up to 2 times." },
  { q: "What happens if I return a book late?",  a: "A fine is automatically calculated per overdue day. You can pay it from the My Fines page." },
  { q: "How do I reserve a book?",               a: "Search for the book and click Reserve. You'll be notified when it's ready for pickup." },
  { q: "Can I cancel a reservation?",            a: "Yes — visit My Reservations and click Cancel on any active reservation." },
];

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!formData.name.trim())    e.name    = "Name is required";
    if (!formData.email.trim())   e.email   = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Enter a valid email";
    if (!formData.subject.trim()) e.subject = "Subject is required";
    if (!formData.message.trim()) e.message = "Message is required";
    return e;
  };

  const handleChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1400);
  };

  const handleNewMessage = () => setSubmitted(false);

  return (
    <DashboardLayout userRole="student">
      <div className="cub-root">

        {/* ══ HERO ════════════════════════════════════════ */}
        <div className="cub-hero">
          <div className="cub-hero-blob cub-hero-blob--1" />
          <div className="cub-hero-blob cub-hero-blob--2" />
          <div className="cub-hero-inner">
            <div className="cub-hero-eyebrow">💬 We're Here to Help</div>
            <h1 className="cub-hero-title">
              Get In <em className="cub-hero-em">Touch</em>
            </h1>
            <p className="cub-hero-desc">
              Have a question, issue, or feedback? Our library team is ready to assist you.
              Reach out through any channel below.
            </p>
          </div>
        </div>

        {/* ══ CONTACT CARDS ROW ═══════════════════════════ */}
        <div className="cub-contact-cards">
          {[
            { icon: <Mail size={22} />,    cls: "blue",   label: "Email Us",       val: "info@library.edu",              sub: "We reply within 24 hours"       },
            { icon: <Phone size={22} />,   cls: "green",  label: "Call Us",        val: "+94 76 052 5273",               sub: "Mon–Fri, 8:30 AM – 5:00 PM"     },
            { icon: <MapPin size={22} />,  cls: "purple", label: "Visit Us",       val: "123 University Street, Colombo", sub: "Sri Lanka"                      },
            { icon: <Clock size={22} />,   cls: "amber",  label: "Library Hours",  val: "Mon–Fri  8:30 – 5:00",          sub: "Sat  9:00 AM – 1:00 PM"         },
          ].map((c) => (
            <div key={c.label} className={`cub-contact-card cub-contact-card--${c.cls}`}>
              <div className={`cub-contact-card-icon cub-contact-card-icon--${c.cls}`}>{c.icon}</div>
              <div className="cub-contact-card-body">
                <div className="cub-contact-card-label">{c.label}</div>
                <div className="cub-contact-card-val">{c.val}</div>
                <div className="cub-contact-card-sub">{c.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ══ MAIN TWO-COL ════════════════════════════════ */}
        <div className="cub-main">

          {/* ── Left: form ── */}
          <div className="cub-form-panel">
            <div className="cub-panel-header">
              <div className="cub-panel-icon"><MessageSquare size={20} /></div>
              <div>
                <h2 className="cub-panel-title">Send Us a Message</h2>
                <p className="cub-panel-sub">We'll get back to you as soon as possible</p>
              </div>
            </div>

            {submitted ? (
              <div className="cub-success">
                <div className="cub-success-icon">✅</div>
                <h3 className="cub-success-title">Message Sent!</h3>
                <p className="cub-success-desc">
                  Thank you for reaching out. Our team will get back to you within 24 hours.
                </p>
                <button className="cub-success-btn" onClick={handleNewMessage}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className="cub-form" onSubmit={handleSubmit} noValidate>
                <div className="cub-form-row">
                  <div className="cub-field">
                    <label className="cub-label">Full Name <span className="cub-req">*</span></label>
                    <input
                      className={`cub-input ${errors.name ? "cub-input--error" : ""}`}
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                    />
                    {errors.name && <span className="cub-error">{errors.name}</span>}
                  </div>
                  <div className="cub-field">
                    <label className="cub-label">Email Address <span className="cub-req">*</span></label>
                    <input
                      className={`cub-input ${errors.email ? "cub-input--error" : ""}`}
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                    {errors.email && <span className="cub-error">{errors.email}</span>}
                  </div>
                </div>

                <div className="cub-field">
                  <label className="cub-label">Subject <span className="cub-req">*</span></label>
                  <select
                    className={`cub-input ${errors.subject ? "cub-input--error" : ""}`}
                    value={formData.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                  >
                    <option value="">Select a subject...</option>
                    <option>Book Borrowing Issue</option>
                    <option>Fine Dispute</option>
                    <option>Reservation Problem</option>
                    <option>Account / Login Issue</option>
                    <option>Book Suggestion</option>
                    <option>General Enquiry</option>
                    <option>Other</option>
                  </select>
                  {errors.subject && <span className="cub-error">{errors.subject}</span>}
                </div>

                <div className="cub-field">
                  <label className="cub-label">Message <span className="cub-req">*</span></label>
                  <textarea
                    className={`cub-input cub-textarea ${errors.message ? "cub-input--error" : ""}`}
                    rows={5}
                    placeholder="Describe your issue or question in detail..."
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                  />
                  <div className="cub-char-count">{formData.message.length} / 1000</div>
                  {errors.message && <span className="cub-error">{errors.message}</span>}
                </div>

                <button className="cub-submit-btn" type="submit" disabled={submitting}>
                  {submitting ? (
                    <><span className="cub-spinner" /> Sending...</>
                  ) : (
                    <><Send size={16} /> Send Message</>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* ── Right: info + FAQ ── */}
          <div className="cub-right-col">

            {/* Map placeholder */}
            <div className="cub-map-card">
              <div className="cub-map-ph">
                <div className="cub-map-pin">📍</div>
                <div className="cub-map-label">University Library</div>
                <div className="cub-map-addr">123 University Street, Colombo, Sri Lanka</div>
                <a
                  className="cub-map-link"
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>

            {/* FAQ */}
            <div className="cub-faq-panel">
              <h3 className="cub-faq-title">Frequently Asked Questions</h3>
              <div className="cub-faq-list">
                {FAQS.map((faq, i) => (
                  <div key={i} className={`cub-faq-item ${openFaq === i ? "cub-faq-item--open" : ""}`}>
                    <button
                      className="cub-faq-q"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span>{faq.q}</span>
                      <span className="cub-faq-chevron">{openFaq === i ? "▲" : "▼"}</span>
                    </button>
                    {openFaq === i && (
                      <div className="cub-faq-a">{faq.a}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}