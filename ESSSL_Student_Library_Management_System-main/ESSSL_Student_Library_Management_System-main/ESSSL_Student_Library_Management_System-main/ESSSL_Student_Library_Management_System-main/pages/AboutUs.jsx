import { useState } from "react";
import { BookOpen, Target, Eye, HeartHandshake, Users, Award, Clock, Sparkles } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import "../styles/AboutUs.css";

const STATS = [
  { icon: "📚", num: "10,000+", label: "Books Available" },
  { icon: "👥", num: "2,500+",  label: "Active Students"  },
  { icon: "🏆", num: "15+",     label: "Years of Service"  },
  { icon: "⭐", num: "98%",     label: "Satisfaction Rate" },
];

const VALUES = [
  { icon: "🔓", title: "Accessibility",    desc: "Every student deserves equal access to knowledge, regardless of background or ability." },
  { icon: "📖", title: "Lifelong Learning", desc: "We foster curiosity and the love of reading beyond the classroom walls." },
  { icon: "🤝", title: "Integrity",         desc: "We uphold trust, transparency and honesty in everything we do." },
  { icon: "💡", title: "Innovation",        desc: "We embrace technology to continuously improve the library experience." },
  { icon: "🎯", title: "Student-Centered",  desc: "Every decision we make starts with what's best for our students." },
  { icon: "🌱", title: "Growth",            desc: "We invest in expanding our collection and services to meet evolving needs." },
];

const TEAM = [
  { initials: "DR", name: "Dr. Roshan Silva",   role: "Chief Librarian",         dept: "Administration" },
  { initials: "AM", name: "Amali Mendis",        role: "Digital Resources Lead",  dept: "Technology"     },
  { initials: "KP", name: "Kumara Perera",       role: "Student Services Officer", dept: "Student Affairs" },
  { initials: "NF", name: "Nadia Fernando",      role: "Cataloging Specialist",   dept: "Collections"    },
];

const TIMELINE = [
  { year: "2009", title: "Library Founded",        desc: "Established with 1,000 books and a vision for the future." },
  { year: "2013", title: "Digital Expansion",      desc: "Launched our first digital catalog and online reservation system." },
  { year: "2018", title: "Modern Renovation",      desc: "Redesigned the physical and digital spaces for a better experience." },
  { year: "2022", title: "Smart Library System",   desc: "Introduced automated borrowing, fines management, and student portals." },
  { year: "2025", title: "10,000 Books Milestone", desc: "Reached 10,000 titles across print and digital collections." },
];

export default function AboutUs() {
  const [activeValue, setActiveValue] = useState(null);

  return (
    <DashboardLayout userRole="student">
      <div className="abu-root">

        {/* ══ HERO ════════════════════════════════════════ */}
        <div className="abu-hero">
          <div className="abu-hero-blob abu-hero-blob--1" />
          <div className="abu-hero-blob abu-hero-blob--2" />
          <div className="abu-hero-blob abu-hero-blob--3" />

          <div className="abu-hero-inner">
            <div className="abu-hero-badge">🏛️ Smart Library Management System</div>
            <h1 className="abu-hero-title">
              More Than a Library —<br />
              <em className="abu-hero-em">A Gateway to Knowledge</em>
            </h1>
            <p className="abu-hero-desc">
              We are dedicated to empowering students and educators with seamless access
              to books, digital resources, and academic tools that inspire lifelong learning.
            </p>
            <div className="abu-hero-divider" />

            {/* Stats row */}
            <div className="abu-stats">
              {STATS.map((s) => (
                <div key={s.label} className="abu-stat">
                  <div className="abu-stat-icon">{s.icon}</div>
                  <div className="abu-stat-num">{s.num}</div>
                  <div className="abu-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ MISSION + VISION ════════════════════════════ */}
        <div className="abu-mv-grid">
          <div className="abu-mv-card abu-mv-card--mission">
            <div className="abu-mv-icon-wrap abu-mv-icon-wrap--mission">
              <Target size={28} />
            </div>
            <div className="abu-mv-tag">Our Mission</div>
            <h2 className="abu-mv-title">Empowering Academic Excellence</h2>
            <p className="abu-mv-text">
              Our mission is to provide students with seamless access to books, academic materials,
              and digital resources that empower academic excellence and lifelong learning. We strive
              to be the intellectual heartbeat of our institution — a place where curiosity is welcomed
              and knowledge is freely shared.
            </p>
            <div className="abu-mv-highlights">
              <span>📚 Curated Collections</span>
              <span>🔍 Easy Discovery</span>
              <span>⚡ Fast Access</span>
            </div>
          </div>

          <div className="abu-mv-card abu-mv-card--vision">
            <div className="abu-mv-icon-wrap abu-mv-icon-wrap--vision">
              <Eye size={28} />
            </div>
            <div className="abu-mv-tag">Our Vision</div>
            <h2 className="abu-mv-title">A Library Without Boundaries</h2>
            <p className="abu-mv-text">
              We envision a modern digital library ecosystem that is innovative, user-friendly,
              inclusive, and accessible to every learner. A space that transcends physical walls —
              where students can discover, borrow, and engage with knowledge from anywhere,
              at any time.
            </p>
            <div className="abu-mv-highlights">
              <span>🌐 Digital-First</span>
              <span>♿ Inclusive</span>
              <span>🔮 Future-Ready</span>
            </div>
          </div>
        </div>

        {/* ══ CORE VALUES ══════════════════════════════════ */}
        <div className="abu-section">
          <div className="abu-section-header">
            <div className="abu-section-eyebrow">💎 What We Stand For</div>
            <h2 className="abu-section-title">Our Core Values</h2>
            <p className="abu-section-sub">The principles that guide every decision we make</p>
          </div>

          <div className="abu-values-grid">
            {VALUES.map((v, i) => (
              <div
                key={v.title}
                className={`abu-value-card ${activeValue === i ? "abu-value-card--active" : ""}`}
                style={{ animationDelay: `${i * 0.07}s` }}
                onMouseEnter={() => setActiveValue(i)}
                onMouseLeave={() => setActiveValue(null)}
              >
                <div className="abu-value-icon">{v.icon}</div>
                <h3 className="abu-value-title">{v.title}</h3>
                <p className="abu-value-desc">{v.desc}</p>
                <div className="abu-value-line" />
              </div>
            ))}
          </div>
        </div>

        {/* ══ TIMELINE ════════════════════════════════════ */}
        <div className="abu-section abu-section--alt">
          <div className="abu-section-header">
            <div className="abu-section-eyebrow">⏳ Our Journey</div>
            <h2 className="abu-section-title">History & Milestones</h2>
            <p className="abu-section-sub">From humble beginnings to a modern smart library</p>
          </div>

          <div className="abu-timeline">
            {TIMELINE.map((t, i) => (
              <div key={t.year} className={`abu-timeline-item ${i % 2 === 0 ? "abu-timeline-item--left" : "abu-timeline-item--right"}`}
                style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="abu-timeline-card">
                  <div className="abu-timeline-year">{t.year}</div>
                  <h3 className="abu-timeline-title">{t.title}</h3>
                  <p className="abu-timeline-desc">{t.desc}</p>
                </div>
                <div className="abu-timeline-dot" />
              </div>
            ))}
            <div className="abu-timeline-line" />
          </div>
        </div>

        {/* ══ TEAM ════════════════════════════════════════ */}
        <div className="abu-section">
          <div className="abu-section-header">
            <div className="abu-section-eyebrow">👥 The People Behind It</div>
            <h2 className="abu-section-title">Meet Our Team</h2>
            <p className="abu-section-sub">Dedicated professionals committed to your library experience</p>
          </div>

          <div className="abu-team-grid">
            {TEAM.map((member, i) => (
              <div key={member.name} className="abu-team-card" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="abu-team-avatar">{member.initials}</div>
                <h3 className="abu-team-name">{member.name}</h3>
                <div className="abu-team-role">{member.role}</div>
                <div className="abu-team-dept">{member.dept}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ CTA BANNER ══════════════════════════════════ */}
        <div className="abu-cta">
          <div className="abu-cta-blob" />
          <div className="abu-cta-inner">
            <div className="abu-cta-icon">📚</div>
            <h2 className="abu-cta-title">Ready to Start Exploring?</h2>
            <p className="abu-cta-desc">
              Browse thousands of books, reserve titles, and manage your reading journey — all in one place.
            </p>
            <div className="abu-cta-actions">
              <a href="/student/books" className="abu-cta-btn abu-cta-btn--primary">Browse Books →</a>
              <a href="/student/borrowing" className="abu-cta-btn abu-cta-btn--ghost">My Borrowings</a>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}