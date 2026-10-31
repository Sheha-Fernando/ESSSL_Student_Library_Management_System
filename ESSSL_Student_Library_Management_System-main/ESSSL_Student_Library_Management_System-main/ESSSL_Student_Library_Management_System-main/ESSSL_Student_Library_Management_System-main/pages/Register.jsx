import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/register.css";

export default function Register() {
  const navigate = useNavigate();

  const [role,            setRole]            = useState("student");
  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error,           setError]           = useState("");
  const [loading,         setLoading]         = useState(false);
  const [showPass,        setShowPass]        = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [focused,         setFocused]         = useState("");
  const [success,         setSuccess]         = useState(false);

  // Password strength
  const getStrength = (pw) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8)            score++;
    if (/[A-Z]/.test(pw))          score++;
    if (/[0-9]/.test(pw))          score++;
    if (/[^A-Za-z0-9]/.test(pw))   score++;
    return score;
  };
  const strength      = getStrength(password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthCls   = ["", "strength--weak", "strength--fair", "strength--good", "strength--strong"][strength];

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (role === "admin") {
      if (!/^admin\.[a-zA-Z0-9]+@gmail\.com$/.test(email)) {
        setError("Admin email must be in the format admin.<name>@gmail.com");
        return;
      }
    } else {
      if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
        setError("Student email must be a valid Gmail address.");
        return;
      }
    }

    const [first_name, ...rest] = name.trim().split(" ");
    const last_name = rest.join(" ") || "-";

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/register", {
        email, password, first_name, last_name, role,
      });
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2200);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-root">

      {/* ── LEFT PANEL ── */}
      <div className="reg-left">

        {/* Animated SVG background — same library scene as login */}
        <svg
          viewBox="0 0 700 700"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:.4 }}
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="rg1" cx="60%" cy="30%" r="55%">
              <stop offset="0%"   stopColor="#7c3aed" stopOpacity=".7" />
              <stop offset="100%" stopColor="#0d1b3e" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="rg2" cx="20%" cy="80%" r="45%">
              <stop offset="0%"   stopColor="#1d4ed8" stopOpacity=".45" />
              <stop offset="100%" stopColor="#0d1b3e" stopOpacity="0"  />
            </radialGradient>
            <radialGradient id="rLamp" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#fbbf24" stopOpacity=".9" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0"  />
            </radialGradient>
          </defs>
          <rect width="700" height="700" fill="url(#rg1)" />
          <rect width="700" height="700" fill="url(#rg2)" />
          <rect x="0" y="580" width="700" height="120" fill="rgba(255,255,255,0.03)" />
          <rect x="0" y="582" width="700" height="1"   fill="rgba(255,255,255,0.08)" />
          {[60,220,480,620].map((x,i)=>(
            <g key={i}>
              <rect x={x}     y="80"  width="14" height="505" rx="3" fill="rgba(255,255,255,0.04)" />
              <rect x={x-4}   y="76"  width="22" height="8"   rx="2" fill="rgba(255,255,255,0.07)" />
              <rect x={x-4}   y="580" width="22" height="8"   rx="2" fill="rgba(255,255,255,0.05)" />
            </g>
          ))}
          {[90,270].map((x,i)=>(
            <g key={i}>
              <rect x={x} y="110" width="110" height="280" rx="55" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
              <rect x={x+4} y="114" width="102" height="272" rx="52" fill={i===0?"rgba(100,140,255,0.06)":"rgba(255,200,100,0.04)"} />
              <line x1={x+55} y1="114" x2={x+55} y2="390" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
              <line x1={x+4}  y1="250" x2={x+106} y2="250" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
            </g>
          ))}
          {/* Bookshelf */}
          <rect x="500" y="120" width="10"  height="465" fill="rgba(180,140,80,0.55)" />
          <rect x="680" y="120" width="10"  height="465" fill="rgba(180,140,80,0.55)" />
          {[180,270,360,450,540].map((y,i)=>(
            <rect key={i} x="500" y={y} width="190" height="6" fill="rgba(200,160,90,0.65)" />
          ))}
          <rect x="498" y="116" width="194" height="10" fill="rgba(200,160,90,0.75)" />
          {[
            {x:504,w:14,h:48,c:"#e53935",sy:180},{x:519,w:10,h:44,c:"#1e88e5",sy:180},
            {x:530,w:16,h:52,c:"#43a047",sy:180},{x:547,w:11,h:45,c:"#fb8c00",sy:180},
            {x:559,w:13,h:50,c:"#8e24aa",sy:180},{x:573,w:9, h:43,c:"#00897b",sy:180},
            {x:504,w:12,h:46,c:"#546e7a",sy:270},{x:517,w:15,h:50,c:"#7986cb",sy:270},
            {x:533,w:10,h:43,c:"#4db6ac",sy:270},{x:544,w:13,h:47,c:"#ff8a65",sy:270},
            {x:558,w:11,h:51,c:"#f06292",sy:270},{x:570,w:14,h:44,c:"#aed581",sy:270},
            {x:504,w:13,h:47,c:"#e57373",sy:360},{x:518,w:10,h:44,c:"#64b5f6",sy:360},
            {x:529,w:15,h:51,c:"#81c784",sy:360},{x:545,w:11,h:46,c:"#ffb74d",sy:360},
            {x:504,w:11,h:45,c:"#b71c1c",sy:450},{x:516,w:14,h:49,c:"#1565c0",sy:450},
            {x:531,w:10,h:43,c:"#2e7d32",sy:450},{x:542,w:13,h:48,c:"#e65100",sy:450},
            {x:504,w:13,h:44,c:"#ff1744",sy:540},{x:518,w:10,h:48,c:"#2979ff",sy:540},
            {x:529,w:14,h:46,c:"#00e676",sy:540},{x:544,w:11,h:50,c:"#ff9100",sy:540},
          ].map((b,i)=>(
            <rect key={i} x={b.x} y={b.sy-b.h} width={b.w} height={b.h} rx="1.5" fill={b.c} fillOpacity="0.82" />
          ))}
          {/* Desk + lamp */}
          <rect x="300" y="500" width="180" height="10" rx="4" fill="rgba(210,170,100,0.65)" />
          <rect x="310" y="510" width="7"   height="72" fill="rgba(180,140,80,0.55)" />
          <rect x="463" y="510" width="7"   height="72" fill="rgba(180,140,80,0.55)" />
          <rect x="446" y="430" width="5"   height="72" fill="rgba(200,200,200,0.4)" />
          <path d="M448 430 Q468 415 473 398" stroke="rgba(200,200,200,0.4)" strokeWidth="4" fill="none" />
          <path d="M463 390 L484 390 L480 406 L467 406 Z" fill="rgba(255,220,50,0.65)" />
          <ellipse cx="474" cy="408" rx="28" ry="18" fill="url(#rLamp)">
            <animate attributeName="opacity" values=".25;.5;.25" dur="3.5s" repeatCount="indefinite" />
          </ellipse>
          {/* Dust motes */}
          {[{cx:420,cy:200},{cx:380,cy:140},{cx:460,cy:300},{cx:270,cy:250},{cx:340,cy:320}].map((p,i)=>(
            <circle key={i} cx={p.cx} cy={p.cy} r="1.8" fill="rgba(255,220,150,0.55)">
              <animate attributeName="cy" values={`${p.cy};${p.cy-20};${p.cy}`} dur={`${3+i*.6}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values=".55;.15;.55" dur={`${3+i*.6}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>

        {/* Floating cards */}
        {[
          { top:"10%", right:"8%",  bg:"rgba(99,102,241,0.18)", delay:"0s",  icon:"✨", label:"Free to Join"     },
          { top:"35%", right:"12%", bg:"rgba(139,92,246,0.15)", delay:".4s", icon:"🔒", label:"Secure & Private"  },
          { top:"60%", right:"6%",  bg:"rgba(59,130,246,0.15)", delay:".8s", icon:"📚", label:"Instant Access"    },
        ].map((c,i)=>(
          <div key={i} className="reg-float-card" style={{
            top:c.top, right:c.right, background:c.bg,
            animationDelay:c.delay,
          }}>
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </div>
        ))}

        {/* Left text */}
        <div className="reg-left-content">
          <p className="reg-left-eyebrow">ESSSL Institute</p>
          <h1 className="reg-left-title">
            Join Our Library<br />
            <em>Community Today</em>
          </h1>
          <p className="reg-left-desc">
            Create your free account and unlock access to thousands of books,
            smart borrowing tools, and your personalised academic library portal.
          </p>
          <div className="reg-left-perks">
            {[
              { icon:"📖", text:"Browse 10,000+ books instantly"   },
              { icon:"🔖", text:"Reserve & manage borrowings online" },
              { icon:"🔔", text:"Due date reminders & alerts"       },
              { icon:"📊", text:"Track your reading history"        },
            ].map((p,i)=>(
              <div key={i} className="reg-perk">
                <span className="reg-perk-icon">{p.icon}</span>
                <span className="reg-perk-text">{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="reg-left-footer">
          <div className="reg-footer-dot" />
          System Online · Academic Year 2025/26
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div className="reg-right">

        {/* Logo */}
        <div className="reg-logo">
          <div className="reg-logo-icon">🏛️</div>
          <div>
            <div className="reg-logo-name">ESSSL Library</div>
            <div className="reg-logo-sub">Management System</div>
          </div>
        </div>

        <h2 className="reg-heading">Create Account</h2>
        <p className="reg-sub">Fill in your details to get started</p>

        {/* Role Toggle */}
        <div className="reg-role-toggle">
          <div className={`reg-role-pill ${role === "admin" ? "admin" : ""}`} />
          <button type="button"
            className={`reg-role-btn ${role === "student" ? "active" : ""}`}
            onClick={() => setRole("student")}
          >
            🎓 Student
          </button>
          <button type="button"
            className={`reg-role-btn ${role === "admin" ? "active" : ""}`}
            onClick={() => setRole("admin")}
          >
            🛡️ Admin
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="reg-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="reg-success">
            <span>🎉</span> Account created! Redirecting to login…
          </div>
        )}

        <form onSubmit={handleRegister}>

          {/* Full Name */}
          <div className="reg-field">
            <label className="reg-label">Full Name</label>
            <div className={`reg-input-wrap ${focused === "name" ? "focused" : ""}`}>
              <span className="reg-icon">👤</span>
              <input
                type="text"
                className="reg-input"
                placeholder="e.g. Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused("")}
              />
            </div>
          </div>

          {/* Email */}
          <div className="reg-field">
            <label className="reg-label">
              Email Address
              {role === "admin" && (
                <span className="reg-hint-tag">admin.name@gmail.com</span>
              )}
            </label>
            <div className={`reg-input-wrap ${focused === "email" ? "focused" : ""}`}>
              <span className="reg-icon">✉️</span>
              <input
                type="email"
                className="reg-input"
                placeholder={role === "admin" ? "admin.yourname@gmail.com" : "you@gmail.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
              />
            </div>
          </div>

          {/* Password */}
          <div className="reg-field">
            <label className="reg-label">Password</label>
            <div className={`reg-input-wrap ${focused === "password" ? "focused" : ""}`}>
              <span className="reg-icon">🔒</span>
              <input
                type={showPass ? "text" : "password"}
                className="reg-input"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
                style={{ paddingRight: 44 }}
              />
              <button type="button" className="reg-eye" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
            {/* Strength meter */}
            {password && (
              <div className="reg-strength">
                <div className="reg-strength-bars">
                  {[1,2,3,4].map(n => (
                    <div key={n} className={`reg-strength-bar ${strength >= n ? strengthCls : ""}`} />
                  ))}
                </div>
                <span className={`reg-strength-label ${strengthCls}`}>{strengthLabel}</span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="reg-field">
            <label className="reg-label">Confirm Password</label>
            <div className={`reg-input-wrap ${focused === "confirm" ? "focused" : ""} ${confirmPassword && confirmPassword !== password ? "mismatch" : ""} ${confirmPassword && confirmPassword === password ? "match" : ""}`}>
              <span className="reg-icon">🔑</span>
              <input
                type={showConfirm ? "text" : "password"}
                className="reg-input"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocused("confirm")}
                onBlur={() => setFocused("")}
                style={{ paddingRight: 44 }}
              />
              <button type="button" className="reg-eye" onClick={() => setShowConfirm(p => !p)} tabIndex={-1}>
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
            {confirmPassword && confirmPassword === password && (
              <p className="reg-match-ok">✓ Passwords match</p>
            )}
          </div>

          {/* Terms */}
          <label className="reg-terms">
            <input type="checkbox" required />
            <span>
              I agree to the <a href="#" className="reg-terms-link">Terms of Service</a> and{" "}
              <a href="#" className="reg-terms-link">Privacy Policy</a>
            </span>
          </label>

          {/* Submit */}
          <button type="submit" className="reg-submit" disabled={loading || success}>
            {loading ? (
              <><div className="reg-spinner" /> Creating account…</>
            ) : success ? (
              <>✅ Account Created!</>
            ) : (
              <>Create Account →</>
            )}
          </button>

        </form>

        <div className="reg-divider">OR</div>

        <div className="reg-login-row">
          Already have an account?{" "}
          <Link to="/login">Sign in here</Link>
        </div>

        {/* Role hint */}
        <div className="reg-role-hint">
          <strong>{role === "student" ? "🎓 Student Account" : "🛡️ Admin Account"}</strong><br />
          {role === "student"
            ? "Access books, reservations, borrowing history, and your personal portal."
            : "Full admin access: manage books, students, fines, and system reports."}
        </div>

      </div>
    </div>
  );
}