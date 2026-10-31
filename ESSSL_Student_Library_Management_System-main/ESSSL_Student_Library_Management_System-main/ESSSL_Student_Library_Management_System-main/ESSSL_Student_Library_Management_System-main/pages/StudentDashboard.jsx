import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Link, useNavigate } from "react-router-dom";
import "../styles/studentDashboard.css";

const API = "http://localhost:5000";

const getDaysLeftColor = (days) => {
  if (days <= 3) return "#ef4444";
  if (days <= 7) return "#f97316";
  return "#22c55e";
};
const getDaysLeftBg = (days) => {
  if (days <= 3) return "rgba(239,68,68,0.12)";
  if (days <= 7) return "rgba(249,115,22,0.12)";
  return "rgba(34,197,94,0.12)";
};

// ── STYLES at module level ──
const styles = {
  loadingContainer: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", height: "60vh", gap: 16,
  },
  spinner: {
    width: 48, height: 48, border: "4px solid #e2e8f0",
    borderTop: "4px solid #6366f1", borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { color: "#64748b", fontFamily: "'DM Sans', sans-serif" },

  // Hero: full-width banner with library illustration
  hero: {
    position: "relative",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 28,
    minHeight: 280,
    display: "flex",
    alignItems: "stretch",
  },
  heroIllustration: {
    position: "absolute", inset: 0,
    background: "linear-gradient(135deg, #1a1035 0%, #2d1b5e 30%, #3b2070 55%, #1e3a5f 80%, #0f2744 100%)",
  },
  heroOverlay: {
    position: "absolute", inset: 0,
    background: "linear-gradient(90deg, rgba(15,39,68,0.92) 0%, rgba(15,39,68,0.6) 55%, rgba(15,39,68,0.1) 100%)",
    zIndex: 2,
  },
  heroContent: {
    position: "relative", zIndex: 3,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    width: "100%", padding: "40px 48px", gap: 24, flexWrap: "wrap",
  },
  heroLeft: { flex: 1, minWidth: 260 },
  heroBadge: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.2)", borderRadius: 999,
    padding: "5px 14px", marginBottom: 16,
  },
  heroTitle: {
    fontFamily: "'DM Serif Display', serif", fontSize: 38, fontWeight: 400,
    color: "white", margin: "0 0 12px", lineHeight: 1.2,
    textShadow: "0 2px 20px rgba(0,0,0,0.3)",
  },
  heroName: {
    background: "linear-gradient(90deg, #a78bfa, #60a5fa)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.75)", fontSize: 15, lineHeight: 1.7, margin: 0,
  },
  heroBtnPrimary: {
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "white",
    padding: "11px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600,
    border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(124,58,237,0.5)",
  },
  heroBtnSecondary: {
    background: "rgba(255,255,255,0.12)", color: "white",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.25)",
    padding: "11px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600,
    cursor: "pointer",
  },

  statsGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 16, marginBottom: 28,
  },
  statCard: {
    background: "white", borderRadius: 16, padding: "22px 24px",
    display: "flex", alignItems: "center", gap: 16, cursor: "pointer",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
  },
  statIcon: {
    width: 52, height: 52, borderRadius: 14, display: "flex",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  statValue: { fontSize: 26, fontWeight: 800, lineHeight: 1, fontFamily: "'DM Serif Display', serif" },
  statLabel: { fontSize: 13, color: "#475569", fontWeight: 600, marginTop: 2 },
  statSub: { fontSize: 11, color: "#94a3b8", marginTop: 2 },

  tabBar: {
    display: "flex", gap: 6, marginBottom: 24, background: "#f8fafc",
    borderRadius: 12, padding: 5, width: "fit-content", flexWrap: "wrap",
  },
  tab: {
    padding: "8px 20px", borderRadius: 8, border: "none", background: "transparent",
    fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
    display: "flex", alignItems: "center", gap: 6,
  },
  tabBadge: {
    background: "#ef4444", color: "white", borderRadius: 999,
    fontSize: 11, fontWeight: 700, padding: "1px 7px",
  },
  section: { marginBottom: 28 },
  sectionHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#1e293b",
    margin: 0, fontWeight: 400,
  },
  viewAllLink: { fontSize: 14, color: "#6366f1", textDecoration: "none", fontWeight: 600 },
  alertBadge: {
    background: "rgba(239,68,68,0.1)", color: "#ef4444",
    padding: "5px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600,
  },
  cardGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16,
  },
  bookCard: {
    background: "white", borderRadius: 14, padding: "18px", position: "relative",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
    display: "flex", flexDirection: "column", gap: 10, overflow: "hidden",
  },
  bookStripe: {
    position: "absolute", top: 0, left: 0, right: 0, height: 4, borderRadius: "14px 14px 0 0",
  },
  bookCover: {
    width: "100%", height: 100, background: "linear-gradient(135deg, #eef2ff, #faf5ff)",
    borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  bookInfo: { flex: 1 },
  bookTitle: { margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#1e293b", lineHeight: 1.3 },
  bookAuthor: { margin: "0 0 8px", fontSize: 13, color: "#64748b" },
  bookMeta: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  daysBadge: { fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999 },
  cardBtn: {
    width: "100%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "white", padding: "9px", borderRadius: 8, fontSize: 13,
    fontWeight: 600, border: "none", cursor: "pointer",
  },
  dueSoonCard: {
    background: "white", borderRadius: 12, padding: "16px 20px",
    display: "flex", alignItems: "center", gap: 14,
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #fee2e2",
  },
  activityList: {
    background: "white", borderRadius: 14, overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
  },
  activityRow: {
    display: "flex", alignItems: "center", gap: 14, padding: "14px 20px",
    borderBottom: "1px solid #f8fafc",
  },
  activityDot: {
    width: 36, height: 36, borderRadius: 10, display: "flex",
    alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
  },
  activityDate: { fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" },
  quickGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 14,
  },
  quickCard: {
    background: "white", borderRadius: 14, padding: "18px 20px",
    display: "flex", alignItems: "center", gap: 12,
    border: "1px solid #f1f5f9", cursor: "pointer",
  },
  quickIcon: {
    width: 42, height: 42, borderRadius: 12, display: "flex",
    alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
  },
  quickLabel: { flex: 1, fontSize: 14, fontWeight: 600, color: "#1e293b" },
  quickArrow: { fontSize: 18, fontWeight: 700 },
  emptyState: {
    textAlign: "center", padding: "48px 24px", background: "white",
    borderRadius: 14, color: "#64748b", fontSize: 15,
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)", display: "flex",
    flexDirection: "column", alignItems: "center", gap: 12, border: "1px solid #f1f5f9",
  },
};

// ── Library CSS Illustration ──
function LibraryIllustration() {
  return (
    <svg
      viewBox="0 0 700 280"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.55 }}
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Sky / background */}
      <defs>
        <radialGradient id="glow1" cx="70%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0f2744" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glow2" cx="20%" cy="70%" r="40%">
          <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0f2744" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background glows */}
      <rect width="700" height="280" fill="url(#glow1)" />
      <rect width="700" height="280" fill="url(#glow2)" />

      {/* Floor */}
      <rect x="0" y="230" width="700" height="50" fill="rgba(255,255,255,0.04)" />
      <rect x="0" y="232" width="700" height="1" fill="rgba(255,255,255,0.1)" />

      {/* ── TALL BOOKSHELVES (right side) ── */}
      {/* Shelf unit 1 */}
      <rect x="440" y="60" width="8" height="175" fill="rgba(180,140,80,0.6)" />
      <rect x="560" y="60" width="8" height="175" fill="rgba(180,140,80,0.6)" />
      {/* Shelves */}
      {[90, 130, 170, 210].map((y, i) => (
        <rect key={i} x="440" y={y} width="128" height="5" fill="rgba(200,160,90,0.7)" />
      ))}
      {/* Top beam */}
      <rect x="438" y="58" width="132" height="7" fill="rgba(200,160,90,0.8)" />

      {/* Books on shelves */}
      {/* Shelf 1 (y=95) */}
      {[
        { x: 444, w: 12, h: 30, c: "#e74c3c" }, { x: 457, w: 9,  h: 28, c: "#3498db" },
        { x: 467, w: 14, h: 32, c: "#2ecc71" }, { x: 482, w: 10, h: 27, c: "#f39c12" },
        { x: 493, w: 13, h: 31, c: "#9b59b6" }, { x: 507, w: 9,  h: 29, c: "#1abc9c" },
        { x: 517, w: 11, h: 30, c: "#e67e22" }, { x: 529, w: 14, h: 28, c: "#e91e63" },
        { x: 544, w: 10, h: 31, c: "#00bcd4" },
      ].map((b, i) => (
        <rect key={i} x={b.x} y={90 - b.h} width={b.w} height={b.h} rx="1"
          fill={b.c} fillOpacity="0.85" />
      ))}
      {/* Shelf 2 (y=130) */}
      {[
        { x: 444, w: 11, h: 28, c: "#ff5722" }, { x: 456, w: 13, h: 32, c: "#607d8b" },
        { x: 470, w: 9,  h: 26, c: "#8bc34a" }, { x: 480, w: 14, h: 30, c: "#ff9800" },
        { x: 495, w: 10, h: 28, c: "#673ab7" }, { x: 506, w: 12, h: 31, c: "#009688" },
        { x: 519, w: 9,  h: 27, c: "#f44336" }, { x: 529, w: 13, h: 29, c: "#2196f3" },
        { x: 543, w: 11, h: 30, c: "#4caf50" },
      ].map((b, i) => (
        <rect key={i} x={b.x} y={130 - b.h} width={b.w} height={b.h} rx="1"
          fill={b.c} fillOpacity="0.85" />
      ))}
      {/* Shelf 3 (y=170) */}
      {[
        { x: 444, w: 13, h: 29, c: "#795548" }, { x: 458, w: 10, h: 31, c: "#03a9f4" },
        { x: 469, w: 12, h: 27, c: "#cddc39" }, { x: 482, w: 9,  h: 30, c: "#ff4081" },
        { x: 492, w: 14, h: 28, c: "#7c4dff" }, { x: 507, w: 11, h: 32, c: "#00e5ff" },
        { x: 519, w: 10, h: 26, c: "#ff6d00" }, { x: 530, w: 13, h: 29, c: "#76ff03" },
        { x: 544, w: 9,  h: 30, c: "#d500f9" },
      ].map((b, i) => (
        <rect key={i} x={b.x} y={170 - b.h} width={b.w} height={b.h} rx="1"
          fill={b.c} fillOpacity="0.8" />
      ))}
      {/* Shelf 4 (y=210) */}
      {[
        { x: 444, w: 10, h: 28, c: "#ef5350" }, { x: 455, w: 14, h: 30, c: "#42a5f5" },
        { x: 470, w: 9,  h: 26, c: "#66bb6a" }, { x: 480, w: 12, h: 31, c: "#ffa726" },
        { x: 493, w: 11, h: 29, c: "#ab47bc" }, { x: 505, w: 13, h: 27, c: "#26c6da" },
        { x: 519, w: 10, h: 30, c: "#ff7043" }, { x: 530, w: 9,  h: 28, c: "#ec407a" },
        { x: 540, w: 14, h: 32, c: "#5c6bc0" },
      ].map((b, i) => (
        <rect key={i} x={b.x} y={210 - b.h} width={b.w} height={b.h} rx="1"
          fill={b.c} fillOpacity="0.85" />
      ))}

      {/* Shelf unit 2 (far right) */}
      <rect x="580" y="80" width="8" height="155" fill="rgba(180,140,80,0.5)" />
      <rect x="680" y="80" width="8" height="155" fill="rgba(180,140,80,0.5)" />
      {[108, 148, 188, 225].map((y, i) => (
        <rect key={i} x="580" y={y} width="108" height="4" fill="rgba(200,160,90,0.6)" />
      ))}
      {[
        { x: 583, w: 11, h: 26, y: 108, c: "#e53935" },
        { x: 595, w: 9,  h: 24, y: 108, c: "#1e88e5" },
        { x: 605, w: 13, h: 28, y: 108, c: "#43a047" },
        { x: 619, w: 10, h: 25, y: 108, c: "#fb8c00" },
        { x: 630, w: 12, h: 27, y: 108, c: "#8e24aa" },
        { x: 643, w: 9,  h: 24, y: 108, c: "#00897b" },
        { x: 653, w: 11, h: 26, y: 108, c: "#f4511e" },
        { x: 583, w: 10, h: 27, y: 148, c: "#546e7a" },
        { x: 594, w: 13, h: 25, y: 148, c: "#7986cb" },
        { x: 608, w: 9,  h: 28, y: 148, c: "#4db6ac" },
        { x: 618, w: 12, h: 24, y: 148, c: "#dce775" },
        { x: 631, w: 10, h: 26, y: 148, c: "#ff80ab" },
        { x: 642, w: 14, h: 27, y: 148, c: "#82b1ff" },
      ].map((b, i) => (
        <rect key={i} x={b.x} y={b.y - b.h} width={b.w} height={b.h} rx="1"
          fill={b.c} fillOpacity="0.8" />
      ))}

      {/* ── READING TABLE ── */}
      {/* Table surface */}
      <rect x="230" y="195" width="160" height="8" rx="3" fill="rgba(210,170,100,0.7)" />
      {/* Table legs */}
      <rect x="238" y="203" width="6" height="32" fill="rgba(180,140,80,0.6)" />
      <rect x="376" y="203" width="6" height="32" fill="rgba(180,140,80,0.6)" />
      <rect x="244" y="228" width="138" height="4" rx="2" fill="rgba(180,140,80,0.5)" />

      {/* Open book on table */}
      <ellipse cx="310" cy="194" rx="28" ry="5" fill="rgba(255,255,255,0.15)" />
      {/* Left page */}
      <path d="M284 194 Q296 185 310 194" fill="rgba(255,248,225,0.85)" stroke="rgba(200,180,120,0.5)" strokeWidth="0.5" />
      {/* Right page */}
      <path d="M310 194 Q324 185 336 194" fill="rgba(255,248,225,0.8)" stroke="rgba(200,180,120,0.5)" strokeWidth="0.5" />
      {/* Text lines on pages */}
      {[188, 191].map((y, i) => (
        <line key={i} x1={288 + i * 2} y1={y} x2={307} y2={y} stroke="rgba(100,80,40,0.3)" strokeWidth="0.8" />
      ))}
      {[188, 191].map((y, i) => (
        <line key={i} x1={313} y1={y} x2={333 - i * 2} y2={y} stroke="rgba(100,80,40,0.3)" strokeWidth="0.8" />
      ))}

      {/* ── DESK LAMP ── */}
      <rect x="348" y="160" width="4" height="36" fill="rgba(200,200,200,0.5)" />
      {/* Arm */}
      <path d="M350 160 Q365 150 370 138" stroke="rgba(200,200,200,0.5)" strokeWidth="3" fill="none" />
      {/* Shade */}
      <path d="M362 132 L380 132 L376 142 L366 142 Z" fill="rgba(255,220,50,0.7)" />
      {/* Lamp glow */}
      <ellipse cx="371" cy="148" rx="22" ry="16">
        <animate attributeName="opacity" values="0.3;0.55;0.3" dur="3s" repeatCount="indefinite" />
        <animate attributeName="rx" values="22;26;22" dur="3s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="371" cy="148" rx="22" ry="16" fill="url(#lampGlow)">
        <animate attributeName="opacity" values="0.3;0.55;0.3" dur="3s" repeatCount="indefinite" />
      </ellipse>

      {/* ── SEATED STUDENT SILHOUETTE ── */}
      {/* Body */}
      <ellipse cx="295" cy="175" rx="14" ry="18" fill="rgba(255,255,255,0.08)" />
      {/* Head */}
      <circle cx="295" cy="154" r="10" fill="rgba(255,255,255,0.1)" />
      {/* Arms reaching to book */}
      <path d="M285 170 Q288 178 295 190" stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M305 170 Q302 178 310 190" stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" strokeLinecap="round" />

      {/* ── ARCHED WINDOWS (left side) ── */}
      {[80, 175].map((x, i) => (
        <g key={i}>
          {/* Window frame */}
          <rect x={x} y="70" width="55" height="120" rx="28" fill="none"
            stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
          {/* Window glass — warm moonlight */}
          <rect x={x + 3} y="73" width="49" height="114" rx="26"
            fill={i === 0 ? "rgba(100,140,255,0.08)" : "rgba(255,200,100,0.06)"} />
          {/* Vertical pane divider */}
          <line x1={x + 27} y1="73" x2={x + 27} y2="187" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
          {/* Horizontal pane divider */}
          <line x1={x + 3} y1="140" x2={x + 52} y2="140" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
          {/* Stars through window */}
          {i === 0 && <>
            <circle cx="95" cy="95" r="1.5" fill="rgba(255,255,255,0.7)" />
            <circle cx="110" cy="88" r="1" fill="rgba(255,255,255,0.5)" />
            <circle cx="101" cy="110" r="1" fill="rgba(255,255,255,0.4)" />
          </>}
          {i === 1 && <>
            <circle cx="195" cy="92" r="1.5" fill="rgba(255,255,255,0.6)" />
            <circle cx="208" cy="105" r="1" fill="rgba(255,255,255,0.5)" />
          </>}
        </g>
      ))}

      {/* ── DECORATIVE PILLARS ── */}
      <rect x="60" y="50" width="12" height="185" rx="3" fill="rgba(255,255,255,0.05)" />
      <rect x="160" y="50" width="12" height="185" rx="3" fill="rgba(255,255,255,0.05)" />
      {/* Pillar caps */}
      <rect x="56" y="48" width="20" height="6" rx="2" fill="rgba(255,255,255,0.08)" />
      <rect x="156" y="48" width="20" height="6" rx="2" fill="rgba(255,255,255,0.08)" />

      {/* ── CEILING DETAILS ── */}
      {/* Ornate ceiling beams */}
      {[0, 140, 280, 420, 560].map((x, i) => (
        <rect key={i} x={x} y="0" width="3" height="60" fill="rgba(255,255,255,0.04)" />
      ))}
      {/* Chandelier */}
      <line x1="350" y1="0" x2="350" y2="35" stroke="rgba(255,220,150,0.4)" strokeWidth="2" />
      <circle cx="350" cy="40" r="8" fill="rgba(255,220,80,0.3)" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x2 = 350 + Math.cos(rad) * 20;
        const y2 = 40  + Math.sin(rad) * 10;
        return <line key={i} x1="350" y1="40" x2={x2} y2={y2} stroke="rgba(255,220,80,0.25)" strokeWidth="1" />;
      })}
      {/* Chandelier glow */}
      <ellipse cx="350" cy="50" rx="40" ry="20" fill="rgba(255,220,80,0.05)">
        <animate attributeName="opacity" values="0.05;0.12;0.05" dur="4s" repeatCount="indefinite" />
      </ellipse>

      {/* ── FLOATING PARTICLES (dust motes) ── */}
      {[
        { cx: 420, cy: 120, r: 1.5 }, { cx: 380, cy: 80,  r: 1 },
        { cx: 460, cy: 160, r: 1.2 }, { cx: 270, cy: 140, r: 1 },
        { cx: 500, cy: 100, r: 0.8 }, { cx: 340, cy: 170, r: 1.3 },
      ].map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="rgba(255,220,150,0.6)">
          <animate attributeName="cy" values={`${p.cy};${p.cy - 15};${p.cy}`} dur={`${3 + i}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur={`${3 + i}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

// ══════════════════════════════════════════════
//  COMPONENT
// ══════════════════════════════════════════════
export default function StudentDashboard() {
  const navigate = useNavigate();

  const user       = JSON.parse(localStorage.getItem("user") || "{}");
  const userId     = user?.id;
  const firstName  = user?.first_name || "Student";
  const lastName   = user?.last_name  || "";
  const fullName   = `${firstName} ${lastName}`.trim();

  const [borrowedBooks,    setBorrowedBooks]    = useState([]);
  const [reservations,     setReservations]     = useState([]);
  const [fines,            setFines]            = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [greeting,         setGreeting]         = useState("");
  const [currentTime,      setCurrentTime]      = useState(new Date());
  const [activeTab,        setActiveTab]        = useState("overview");

  useEffect(() => {
    const hour = new Date().getHours();
    if      (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else                setGreeting("Good Evening");
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { if (userId) fetchAllData(); }, [userId]);

  const fetchAllData = async () => {
    setLoading(true);
    try { await Promise.all([fetchBorrowings(), fetchReservations(), fetchFines()]); }
    finally { setLoading(false); }
  };

  const fetchBorrowings = async () => {
    try {
      const res  = await fetch(`${API}/borrowing?user_id=${userId}`);
      const data = await res.json();
      const active = Array.isArray(data)
        ? data.filter((b) => b.status === "Borrowed").map((b) => ({
            ...b,
            daysLeft: Math.ceil((new Date(b.due_date) - new Date()) / 86400000),
          }))
        : [];
      setBorrowedBooks(active);
      setRecentActivities(
        Array.isArray(data)
          ? data.slice(0, 5).map((b) => ({
              id:     b.id,
              action: b.status === "Returned" ? "Returned" : "Borrowed",
              book:   b.book_title || `Book #${b.book_id}`,
              date:   b.status === "Returned" ? b.return_date : b.borrow_date,
            }))
          : []
      );
    } catch (err) { console.error(err); }
  };

  const fetchReservations = async () => {
    try {
      const res  = await fetch(`${API}/reservations?user_id=${userId}`);
      const data = await res.json();
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const fetchFines = async () => {
    try {
      const res  = await fetch(`${API}/fines?user_id=${userId}`);
      const data = await res.json();
      setFines(Array.isArray(data) ? data.filter((f) => f.status === "pending") : []);
    } catch (err) { console.error(err); }
  };

  const dueSoon         = borrowedBooks.filter((b) => b.daysLeft <= 7 && b.daysLeft >= 0);
  const totalFineAmount = fines.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);

  const quickLinks = [
    { title: "Search Books",    link: "/student/books",        icon: "📚", color: "#6366f1" },
    { title: "My Reservations", link: "/student/reservations", icon: "🔖", color: "#8b5cf6" },
    { title: "My Fines",        link: "/student/fines",        icon: "💳", color: "#ec4899" },
    { title: "My Profile",      link: "/student/profile",      icon: "👤", color: "#14b8a6" },
    { title: "Borrowed Books",  link: "/student/borrows",      icon: "📖", color: "#f59e0b" },
  ];

  if (loading) {
    return (
      <DashboardLayout userRole="student">
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading your dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="student">
     

      <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 1200, margin: "0 auto" }}>

        {/* ══ HERO WITH LIBRARY ILLUSTRATION ══ */}
        <section className="sd-hero" style={styles.hero}>
          {/* Deep space background */}
          <div style={styles.heroIllustration} />
          {/* Animated SVG library scene */}
          <LibraryIllustration />
          {/* Left-to-right gradient overlay so text is readable */}
          <div style={styles.heroOverlay} />
          {/* Content */}
          <div style={styles.heroContent}>
            <div style={styles.heroLeft}>
              <div style={styles.heroBadge}>
                <span style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>
                  📅 {currentTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </span>
              </div>
              <h1 style={styles.heroTitle}>
                {greeting},<br />
                <span style={styles.heroName}>{fullName}</span> 👋
              </h1>
              <p style={styles.heroSubtitle}>
                Welcome to the ESSSL Library portal. You have{" "}
                <strong style={{ color: "#a78bfa" }}>{borrowedBooks.length} active borrowing{borrowedBooks.length !== 1 ? "s" : ""}</strong>
                {dueSoon.length > 0 && (
                  <> and{" "}
                    <strong style={{ color: "#fca5a5" }}>{dueSoon.length} book{dueSoon.length > 1 ? "s" : ""} due soon</strong>
                  </>
                )}.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
                <button className="sd-btn" onClick={() => navigate("/student/books")} style={styles.heroBtnPrimary}>
                  🔍 Search Books
                </button>
                <button className="sd-btn" onClick={() => navigate("/student/borrows")} style={styles.heroBtnSecondary}>
                  📖 My Borrowings
                </button>
              </div>
            </div>

            {/* Right side — live clock card */}
            <div style={{
              background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20,
              padding: "28px 36px", textAlign: "center", minWidth: 170,
            }}>
              <div style={{ fontSize: 44, marginBottom: 8, animation: "float 3s ease-in-out infinite" }}>🏛️</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: "rgba(255,255,255,0.9)", marginBottom: 4 }}>
                ESSSL Library
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Student Portal</div>
              <div style={{
                fontSize: 26, fontWeight: 800, color: "white",
                fontVariantNumeric: "tabular-nums", letterSpacing: 1,
              }}>
                {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                {currentTime.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
            </div>
          </div>
        </section>

        {/* ══ STAT CARDS ══ */}
        <section style={styles.statsGrid}>
          {[
            { label: "Books Borrowed", value: borrowedBooks.length,                icon: "📚", color: "#6366f1", link: "/student/borrows",      sub: "Currently active" },
            { label: "Due Soon",        value: dueSoon.length,                     icon: "⏰", color: "#f97316", link: "/student/borrows",      sub: "Within 7 days" },
            { label: "Reservations",    value: reservations.length,                icon: "🔖", color: "#8b5cf6", link: "/student/reservations", sub: "Pending pickup" },
            { label: "Pending Fines",   value: `Rs.${totalFineAmount.toFixed(2)}`, icon: "💳", color: "#ef4444", link: "/student/fines",        sub: `${fines.length} fine${fines.length !== 1 ? "s" : ""}` },
          ].map((stat, i) => (
            <div key={stat.label} className="sd-stat-card"
              style={{ ...styles.statCard, animationDelay: `${i * 0.1}s` }}
              onClick={() => navigate(stat.link)}
            >
              <div style={{ ...styles.statIcon, background: stat.color + "18", color: stat.color }}>
                <span style={{ fontSize: 22 }}>{stat.icon}</span>
              </div>
              <div>
                <div style={{ ...styles.statValue, color: stat.color }}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
                <div style={styles.statSub}>{stat.sub}</div>
              </div>
            </div>
          ))}
        </section>

        {/* ══ TABS ══ */}
        <div style={styles.tabBar}>
          {["overview", "borrowed", "due soon", "activities"].map((tab) => (
            <button key={tab}
              className={`sd-tab ${activeTab === tab ? "active" : ""}`}
              style={{ ...styles.tab, color: activeTab === tab ? "white" : "#64748b" }}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "due soon" && dueSoon.length > 0 && (
                <span style={styles.tabBadge}>{dueSoon.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ══ BORROWED BOOKS ══ */}
        {(activeTab === "overview" || activeTab === "borrowed") && (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Currently Borrowed</h2>
              <Link to="/student/borrows" style={styles.viewAllLink}>View All →</Link>
            </div>
            {borrowedBooks.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: 48 }}>📭</div>
                <p>No books currently borrowed.</p>
                <button className="sd-btn" onClick={() => navigate("/student/books")} style={styles.heroBtnPrimary}>
                  Browse Books
                </button>
              </div>
            ) : (
              <div style={styles.cardGrid}>
                {borrowedBooks.map((book, i) => (
                  <div key={book.id} className="sd-book-card"
                    style={{ ...styles.bookCard, animationDelay: `${i * 0.08}s` }}
                  >
                    <div style={{ ...styles.bookStripe, background: getDaysLeftColor(book.daysLeft) }} />
                    <div style={styles.bookCover}>
                      {book.cover_image
                        ? <img src={`${API}/uploads/${book.cover_image}`} alt={book.book_title}
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
                        : <span style={{ fontSize: 36 }}>📗</span>
                      }
                    </div>
                    <div style={styles.bookInfo}>
                      <h3 style={styles.bookTitle}>{book.book_title || `Book #${book.book_id}`}</h3>
                      <p style={styles.bookAuthor}>{book.author || "Unknown Author"}</p>
                      <div style={styles.bookMeta}>
                        <span style={{ fontSize: 12, color: "#64748b" }}>
                          Due: {book.due_date ? new Date(book.due_date).toLocaleDateString() : "N/A"}
                        </span>
                        <span style={{ ...styles.daysBadge, color: getDaysLeftColor(book.daysLeft), background: getDaysLeftBg(book.daysLeft) }}>
                          {book.daysLeft < 0 ? `${Math.abs(book.daysLeft)}d overdue` : `${book.daysLeft}d left`}
                        </span>
                      </div>
                    </div>
                    <Link to="/student/borrows">
                      <button className="sd-btn" style={styles.cardBtn}>Manage</button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ══ DUE SOON ══ */}
        {(activeTab === "overview" || activeTab === "due soon") && (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Due Soon</h2>
              {dueSoon.length > 0 && <span style={styles.alertBadge}>{dueSoon.length} urgent</span>}
            </div>
            {dueSoon.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: 48 }}>✅</div>
                <p>No books due soon — you're all caught up!</p>
              </div>
            ) : (
              <div style={styles.cardGrid}>
                {dueSoon.map((book, i) => (
                  <div key={book.id} style={{ ...styles.dueSoonCard, animationDelay: `${i * 0.08}s` }}>
                    <div style={{ fontSize: 28 }}>⏰</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#1e293b" }}>
                        {book.book_title || `Book #${book.book_id}`}
                      </h4>
                      <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                        Due: {book.due_date ? new Date(book.due_date).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <span style={{ ...styles.daysBadge, color: getDaysLeftColor(book.daysLeft), background: getDaysLeftBg(book.daysLeft), fontSize: 13, padding: "6px 12px" }}>
                      {book.daysLeft}d left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ══ RECENT ACTIVITIES ══ */}
        {(activeTab === "overview" || activeTab === "activities") && (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Recent Activities</h2>
            </div>
            {recentActivities.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: 48 }}>📋</div>
                <p>No recent activities found.</p>
              </div>
            ) : (
              <div style={styles.activityList}>
                {recentActivities.map((act, i) => {
                  const colorMap = {
                    Borrowed: { bg: "rgba(99,102,241,0.1)",  color: "#6366f1" },
                    Returned: { bg: "rgba(34,197,94,0.1)",   color: "#22c55e" },
                    Reserved: { bg: "rgba(139,92,246,0.1)",  color: "#8b5cf6" },
                  };
                  const c = colorMap[act.action] || { bg: "#f1f5f9", color: "#64748b" };
                  return (
                    <div key={act.id} className="sd-activity-row"
                      style={{ ...styles.activityRow, animationDelay: `${i * 0.07}s` }}
                    >
                      <div style={{ ...styles.activityDot, background: c.bg, color: c.color }}>
                        {act.action === "Borrowed" ? "📖" : act.action === "Returned" ? "✅" : "🔖"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600, color: c.color, fontSize: 13 }}>{act.action}</span>
                        <span style={{ color: "#475569", fontSize: 14, marginLeft: 8 }}>{act.book}</span>
                      </div>
                      <span style={styles.activityDate}>
                        {act.date ? new Date(act.date).toLocaleDateString() : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ══ QUICK LINKS ══ */}
        {activeTab === "overview" && (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Quick Access</h2>
            </div>
            <div style={styles.quickGrid}>
              {quickLinks.map((ql, i) => (
                <div key={ql.title} className="sd-quick-link"
                  style={{ ...styles.quickCard, animationDelay: `${i * 0.08}s`, boxShadow: `0 4px 20px ${ql.color}22` }}
                  onClick={() => navigate(ql.link)}
                >
                  <div style={{ ...styles.quickIcon, background: ql.color + "18", color: ql.color }}>{ql.icon}</div>
                  <span style={styles.quickLabel}>{ql.title}</span>
                  <span style={{ ...styles.quickArrow, color: ql.color }}>→</span>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </DashboardLayout>
  );
}