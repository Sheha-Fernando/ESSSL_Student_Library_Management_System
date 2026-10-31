import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState("student");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused,  setFocused]  = useState("");
  const [success,  setSuccess]  = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/login", { email, password, role });
      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        const name = res.data.user?.first_name || (role === "admin" ? "Admin" : "Student");
        setSuccess(`Welcome back, ${name}! Redirecting you now...`);
        setTimeout(() => {
          navigate(role === "admin" ? "/admin/dashboard" : "/student/dashboard");
        }, 1400);
      } else {
        setError(res.data.message || "Invalid credentials.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">

      {/* ══ LEFT PANEL ══════════════════════════════════════════════ */}
      <div className="login-left">

        <svg
          viewBox="0 0 700 700"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.45 }}
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="lg1" cx="60%" cy="30%" r="55%">
              <stop offset="0%"   stopColor="#7c3aed" stopOpacity=".7" />
              <stop offset="100%" stopColor="#0d1b3e" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="lg2" cx="20%" cy="80%" r="45%">
              <stop offset="0%"   stopColor="#1d4ed8" stopOpacity=".45" />
              <stop offset="100%" stopColor="#0d1b3e" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="lampG" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#fbbf24" stopOpacity=".9" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="700" height="700" fill="url(#lg1)" />
          <rect width="700" height="700" fill="url(#lg2)" />
          <rect x="0" y="580" width="700" height="120" fill="rgba(255,255,255,0.03)" />
          <rect x="0" y="582" width="700" height="1"   fill="rgba(255,255,255,0.08)" />

          {[60, 220, 480, 620].map((x, i) => (
            <g key={i}>
              <rect x={x}     y="80"  width="14" height="505" rx="3" fill="rgba(255,255,255,0.04)" />
              <rect x={x - 4} y="76"  width="22" height="8"   rx="2" fill="rgba(255,255,255,0.07)" />
              <rect x={x - 4} y="580" width="22" height="8"   rx="2" fill="rgba(255,255,255,0.05)" />
            </g>
          ))}

          {[90, 270].map((x, i) => (
            <g key={i}>
              <rect x={x} y="110" width="110" height="280" rx="55"
                fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
              <rect x={x + 4} y="114" width="102" height="272" rx="52"
                fill={i === 0 ? "rgba(100,140,255,0.06)" : "rgba(255,200,100,0.04)"} />
              <line x1={x + 55} y1="114" x2={x + 55} y2="390"
                stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
              <line x1={x + 4} y1="250" x2={x + 106} y2="250"
                stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
              {[130, 160, 300, 330].map((cy, j) => (
                <circle key={j} cx={x + 30 + j * 18} cy={cy} r={1 + j % 2}
                  fill="rgba(255,255,255,0.5)" />
              ))}
            </g>
          ))}

          <rect x="500" y="120" width="10"  height="465" fill="rgba(180,140,80,0.55)" />
          <rect x="680" y="120" width="10"  height="465" fill="rgba(180,140,80,0.55)" />
          {[180, 270, 360, 450, 540].map((y, i) => (
            <rect key={i} x="500" y={y} width="190" height="6" fill="rgba(200,160,90,0.65)" />
          ))}
          <rect x="498" y="116" width="194" height="10" fill="rgba(200,160,90,0.75)" />

          {[
            ...[
              {x:504,w:14,h:48,c:"#e53935"},{x:519,w:10,h:44,c:"#1e88e5"},
              {x:530,w:16,h:52,c:"#43a047"},{x:547,w:11,h:45,c:"#fb8c00"},
              {x:559,w:13,h:50,c:"#8e24aa"},{x:573,w:9, h:43,c:"#00897b"},
              {x:583,w:14,h:47,c:"#f4511e"},{x:598,w:12,h:51,c:"#c0392b"},
              {x:611,w:10,h:44,c:"#2980b9"},{x:622,w:15,h:49,c:"#27ae60"},
              {x:638,w:11,h:46,c:"#d35400"},{x:650,w:13,h:48,c:"#8e44ad"},
            ].map(b=>({...b,sy:180})),
            ...[
              {x:504,w:12,h:46,c:"#546e7a"},{x:517,w:15,h:50,c:"#7986cb"},
              {x:533,w:10,h:43,c:"#4db6ac"},{x:544,w:13,h:47,c:"#ff8a65"},
              {x:558,w:11,h:51,c:"#f06292"},{x:570,w:14,h:44,c:"#aed581"},
              {x:585,w:10,h:48,c:"#4fc3f7"},{x:596,w:13,h:46,c:"#ce93d8"},
              {x:610,w:12,h:50,c:"#ffcc02"},{x:623,w:10,h:43,c:"#80cbc4"},
              {x:634,w:15,h:47,c:"#ef9a9a"},{x:650,w:11,h:52,c:"#b39ddb"},
            ].map(b=>({...b,sy:270})),
            ...[
              {x:504,w:13,h:47,c:"#e57373"},{x:518,w:10,h:44,c:"#64b5f6"},
              {x:529,w:15,h:51,c:"#81c784"},{x:545,w:11,h:46,c:"#ffb74d"},
              {x:557,w:13,h:49,c:"#ba68c8"},{x:571,w:10,h:43,c:"#4dd0e1"},
              {x:582,w:14,h:48,c:"#ff8a80"},{x:597,w:12,h:52,c:"#82b1ff"},
              {x:610,w:10,h:45,c:"#ccff90"},{x:621,w:15,h:47,c:"#ea80fc"},
              {x:637,w:11,h:50,c:"#80d8ff"},{x:649,w:13,h:46,c:"#ffd180"},
            ].map(b=>({...b,sy:360})),
            ...[
              {x:504,w:11,h:45,c:"#b71c1c"},{x:516,w:14,h:49,c:"#1565c0"},
              {x:531,w:10,h:43,c:"#2e7d32"},{x:542,w:13,h:48,c:"#e65100"},
              {x:556,w:12,h:46,c:"#6a1b9a"},{x:569,w:10,h:44,c:"#00695c"},
              {x:580,w:15,h:51,c:"#bf360c"},{x:596,w:11,h:47,c:"#0d47a1"},
              {x:608,w:13,h:45,c:"#1b5e20"},{x:622,w:10,h:49,c:"#e64a19"},
              {x:633,w:14,h:46,c:"#4a148c"},{x:648,w:12,h:44,c:"#006064"},
            ].map(b=>({...b,sy:450})),
            ...[
              {x:504,w:13,h:44,c:"#ff1744"},{x:518,w:10,h:48,c:"#2979ff"},
              {x:529,w:14,h:46,c:"#00e676"},{x:544,w:11,h:50,c:"#ff9100"},
              {x:556,w:13,h:43,c:"#d500f9"},{x:570,w:10,h:47,c:"#1de9b6"},
              {x:581,w:15,h:45,c:"#ff3d00"},{x:597,w:12,h:49,c:"#3d5afe"},
              {x:610,w:10,h:44,c:"#76ff03"},{x:621,w:14,h:47,c:"#ffea00"},
              {x:636,w:11,h:48,c:"#f50057"},{x:648,w:13,h:45,c:"#00b0ff"},
            ].map(b=>({...b,sy:540})),
          ].map((b, i) => (
            <rect key={i} x={b.x} y={b.sy - b.h} width={b.w} height={b.h}
              rx="1.5" fill={b.c} fillOpacity="0.82" />
          ))}

          <rect x="300" y="500" width="180" height="10" rx="4" fill="rgba(210,170,100,0.65)" />
          <rect x="310" y="510" width="7"   height="72" fill="rgba(180,140,80,0.55)" />
          <rect x="463" y="510" width="7"   height="72" fill="rgba(180,140,80,0.55)" />
          <rect x="317" y="572" width="152" height="5"  rx="2" fill="rgba(180,140,80,0.45)" />
          <path d="M340 499 Q367 486 390 499" fill="rgba(255,248,225,0.8)"  stroke="rgba(200,180,120,0.4)" strokeWidth="0.5" />
          <path d="M390 499 Q413 486 435 499" fill="rgba(255,248,225,0.75)" stroke="rgba(200,180,120,0.4)" strokeWidth="0.5" />
          {[492, 496].map((y, i) => (
            <line key={i} x1={343} y1={y} x2={387} y2={y} stroke="rgba(100,80,40,0.25)" strokeWidth="0.8" />
          ))}
          {[492, 496].map((y, i) => (
            <line key={i} x1={393} y1={y} x2={432} y2={y} stroke="rgba(100,80,40,0.25)" strokeWidth="0.8" />
          ))}

          <rect x="446" y="430" width="5" height="72" fill="rgba(200,200,200,0.4)" />
          <path d="M448 430 Q468 415 473 398" stroke="rgba(200,200,200,0.4)" strokeWidth="4" fill="none" />
          <path d="M463 390 L484 390 L480 406 L467 406 Z" fill="rgba(255,220,50,0.65)" />
          <ellipse cx="474" cy="408" rx="28" ry="18" fill="url(#lampG)">
            <animate attributeName="opacity" values=".25;.5;.25" dur="3.5s" repeatCount="indefinite" />
          </ellipse>

          <line x1="350" y1="0" x2="350" y2="50" stroke="rgba(255,220,150,0.35)" strokeWidth="2.5" />
          <circle cx="350" cy="58" r="12" fill="rgba(255,220,80,0.25)" />
          {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((ang, i) => {
            const r = (ang * Math.PI) / 180;
            return (
              <line key={i} x1="350" y1="58"
                x2={350 + Math.cos(r) * 28} y2={58 + Math.sin(r) * 14}
                stroke="rgba(255,220,80,0.2)" strokeWidth="1.5" />
            );
          })}
          <ellipse cx="350" cy="72" rx="52" ry="26" fill="rgba(255,220,80,0.04)">
            <animate attributeName="opacity" values=".04;.1;.04" dur="4s" repeatCount="indefinite" />
          </ellipse>

          {[
            {cx:420,cy:200},{cx:380,cy:140},{cx:460,cy:300},
            {cx:270,cy:250},{cx:500,cy:180},{cx:340,cy:320},
            {cx:310,cy:160},{cx:440,cy:420},
          ].map((p, i) => (
            <circle key={i} cx={p.cx} cy={p.cy} r="1.8" fill="rgba(255,220,150,0.55)">
              <animate attributeName="cy"
                values={`${p.cy};${p.cy - 20};${p.cy}`}
                dur={`${3 + i * 0.6}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values=".55;.15;.55"
                dur={`${3 + i * 0.6}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>

        {/* Floating Feature Cards */}
        {[
          { top: "12%", right: "8%",  bg: "rgba(99,102,241,0.18)", delay: "0s",  icon: "📖", label: "10,000+ Books"  },
          { top: "38%", right: "12%", bg: "rgba(139,92,246,0.15)", delay: ".4s", icon: "🎓", label: "Student Portal" },
          { top: "62%", right: "6%",  bg: "rgba(59,130,246,0.15)", delay: ".8s", icon: "🔍", label: "Smart Search"   },
        ].map((card, i) => (
          <div key={i} className="book-float"
            style={{
              top: card.top, right: card.right, background: card.bg,
              padding: "12px 16px", zIndex: 2,
              animation: `bookFloat ${3.5 + i * 0.5}s ${card.delay} ease-in-out infinite`,
            }}
          >
            <span style={{ marginRight: 8 }}>{card.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap" }}>
              {card.label}
            </span>
          </div>
        ))}

        {/* Left Text Content */}
        <div className="login-left-content">
          <p style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: "rgba(167,139,250,0.85)", marginBottom: 16, fontWeight: 600 }}>
            ESSSL Institute
          </p>
          <h1 className="left-tagline">
            Your Gateway to<br />
            <em>Knowledge &amp; Learning</em>
          </h1>
          <p className="left-desc">
            Access thousands of books, manage borrowings, track reservations,
            and explore academic resources — all in one intelligent library system.
          </p>
          <div className="left-stats">
            <div className="left-stat">
              <span className="left-stat-num">10K+</span>
              <span className="left-stat-label">Books</span>
            </div>
            <div className="stat-divider" />
            <div className="left-stat">
              <span className="left-stat-num">2,400</span>
              <span className="left-stat-label">Students</span>
            </div>
            <div className="stat-divider" />
            <div className="left-stat">
              <span className="left-stat-num">98%</span>
              <span className="left-stat-label">Satisfaction</span>
            </div>
          </div>
        </div>

        <div className="left-footer">
          <div className="left-footer-dot" />
          System Online · Academic Year 2025/26
        </div>
      </div>

      {/* ══ RIGHT PANEL ═════════════════════════════════════════════ */}
      <div className="login-right">

        <div className="right-logo">
          <div className="right-logo-icon">🏛️</div>
          <div>
            <div className="right-logo-text">ESSSL Library</div>
            <div className="right-logo-sub">Management System</div>
          </div>
        </div>

        <h2 className="right-heading">Welcome back</h2>
        <p className="right-sub">Sign in to continue to your library portal</p>

        {/* Role Toggle */}
        <div className="role-toggle">
          <div className={`role-toggle-pill ${role === "admin" ? "admin" : ""}`} />
          <button type="button" className={`role-btn ${role === "student" ? "active" : ""}`} onClick={() => setRole("student")}>
            🎓 Student
          </button>
          <button type="button" className={`role-btn ${role === "admin" ? "active" : ""}`} onClick={() => setRole("admin")}>
            🛡️ Admin
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="error-msg">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Success Banner */}
        {success && (
          <div className="success-msg">
            <span>✅</span> {success}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <div className="input-wrap">
            <label className="input-label">Email Address</label>
            <div className={`input-field-wrap ${focused === "email" ? "focused" : ""}`}>
              <span className="input-icon">✉️</span>
              <input
                type="email"
                className={`input-field ${error ? "has-error" : ""}`}
                placeholder="you@esssl.edu.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="input-wrap">
            <label className="input-label">Password</label>
            <div className={`input-field-wrap ${focused === "password" ? "focused" : ""}`}>
              <span className="input-icon">🔒</span>
              <input
                type={showPass ? "text" : "password"}
                className={`input-field ${error ? "has-error" : ""}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
                autoComplete="current-password"
                style={{ paddingRight: 44 }}
              />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="options-row">
            <label className="remember-label">
              <input type="checkbox" />
              Remember me
            </label>
            <Link to="#" className="forgot-link">Forgot password?</Link>
          </div>

          <button
            type="submit"
            className={`submit-btn ${success ? "submit-btn--success" : ""}`}
            disabled={loading || !!success}
          >
            {loading ? (
              <><div className="btn-spinner" /> Signing in...</>
            ) : success ? (
              <>✅ Login Successful!</>
            ) : (
              <>Sign In →</>
            )}
          </button>

        </form>

        <div className="divider">OR</div>

        <div className="signup-row">
          Don't have an account?{" "}
          <Link to="/register">Create one free</Link>
        </div>

        <div className="role-hint">
          <strong>{role === "student" ? "🎓 Student Access" : "🛡️ Admin Access"}</strong>
          <br />
          {role === "student"
            ? "Search books, manage borrowings, reservations & your profile."
            : "Full system access: manage books, students, fines & reports."}
        </div>

      </div>
    </div>
  );
}