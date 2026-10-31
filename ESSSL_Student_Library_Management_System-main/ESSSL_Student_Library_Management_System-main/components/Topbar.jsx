import { useState, useEffect, useRef } from "react";
import { LogOut, User, Home, Phone, Info, Heart, Bell, ChevronDown, Settings, BookOpen, Shield } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Topbar.css";

// Mock notifications — replace with real API call if needed
const MOCK_NOTIFICATIONS = {
  admin: [
    { id: 1, icon: "⚠️", title: "3 overdue returns",      desc: "Students haven't returned books",   time: "2m ago",  unread: true  },
    { id: 2, icon: "🔖", title: "New reservation request", desc: "Alex Johnson reserved Clean Code",  time: "14m ago", unread: true  },
    { id: 3, icon: "💰", title: "Fine payment received",   desc: "$5.00 paid by Sarah Lee",           time: "1h ago",  unread: true  },
    { id: 4, icon: "📚", title: "Low stock alert",         desc: "Design Patterns — 1 copy left",    time: "3h ago",  unread: false },
    { id: 5, icon: "✅", title: "Book returned",           desc: "The Pragmatic Programmer returned", time: "5h ago",  unread: false },
  ],
  student: [
    { id: 1, icon: "🔖", title: "Reservation ready!",  desc: "Your book is ready for pickup",  time: "5m ago",  unread: true  },
    { id: 2, icon: "⏰", title: "Due date reminder",    desc: "Clean Code due in 2 days",       time: "1h ago",  unread: true  },
    { id: 3, icon: "💰", title: "Fine issued",          desc: "$3.00 fine for late return",     time: "2h ago",  unread: false },
  ],
};

export default function Topbar({ userRole, userName }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [notifOpen,      setNotifOpen]      = useState(false);
  const [profileOpen,    setProfileOpen]    = useState(false);
  const [notifications,  setNotifications]  = useState(
    MOCK_NOTIFICATIONS[userRole] || MOCK_NOTIFICATIONS.student
  );

  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // ── Role-based home path ──────────────────────────────────────────
  const homePath = userRole === "admin" ? "/admin/dashboard" : "/student/dashboard";

  // ── Nav links ─────────────────────────────────────────────────────
  const navLinks = [
    { path: homePath,     icon: Home,  label: "Home"    },
    { path: "/aboutus",   icon: Info,  label: "About"   },
    { path: "/contactus", icon: Phone, label: "Contact" },
    { path: "/donate",    icon: Heart, label: "Donate"  },
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = () =>
    setNotifications((p) => p.map((n) => ({ ...n, unread: false })));

  const markOneRead = (id) =>
    setNotifications((p) => p.map((n) => n.id === id ? { ...n, unread: false } : n));

  const isActive = (path) => location.pathname === path;

  const displayName = userName || (userRole === "admin" ? "Admin" : "Student");
  const initials    = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <header className="tb-root">
      {/* Shimmer line at top */}
      <div className="tb-top-line" />

      {/* ── LEFT ── */}
      <div className="tb-left">
        <div className="tb-brand" onClick={() => navigate(homePath)}>
          <div className="tb-brand-icon">
            <BookOpen size={16} strokeWidth={2.5} />
          </div>
          <div className="tb-brand-text">
            <span className="tb-brand-name">LibraryMS</span>
            <span className="tb-brand-role">
              {userRole === "admin" ? (
                <><Shield size={10} /> Admin</>
              ) : (
                <><User size={10} /> Student</>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ── CENTER NAV ── */}
      <nav className="tb-nav">
        {navLinks.map(({ path, icon: Icon, label }) => (
          <button
            key={path}
            className={`tb-nav-btn ${isActive(path) ? "tb-nav-btn--active" : ""}`}
            onClick={() => navigate(path)}
          >
            <Icon size={14} strokeWidth={2.2} />
            <span>{label}</span>
            {isActive(path) && <span className="tb-nav-dot" />}
          </button>
        ))}
      </nav>

      {/* ── RIGHT ── */}
      <div className="tb-right">

        {/* Notification Bell */}
        <div className="tb-notif-wrap" ref={notifRef}>
          <button
            className={`tb-icon-btn ${notifOpen ? "tb-icon-btn--open" : ""}`}
            onClick={() => { setNotifOpen((p) => !p); setProfileOpen(false); }}
            aria-label="Notifications"
          >
            <Bell size={17} strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="tb-notif-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="tb-dropdown tb-notif-panel">
              <div className="tb-dropdown-header">
                <span className="tb-dropdown-title">Notifications</span>
                {unreadCount > 0 && (
                  <button className="tb-mark-read" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className="tb-notif-list">
                {notifications.length === 0 ? (
                  <div className="tb-notif-empty">
                    <Bell size={28} />
                    <p>All caught up!</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`tb-notif-item ${n.unread ? "tb-notif-item--unread" : ""}`}
                      onClick={() => markOneRead(n.id)}
                    >
                      <span className="tb-notif-emoji">{n.icon}</span>
                      <div className="tb-notif-body">
                        <p className="tb-notif-title">{n.title}</p>
                        <p className="tb-notif-desc">{n.desc}</p>
                        <p className="tb-notif-time">{n.time}</p>
                      </div>
                      {n.unread && <span className="tb-notif-dot" />}
                    </div>
                  ))
                )}
              </div>

              <div className="tb-dropdown-footer">
                <button className="tb-view-all" onClick={() => setNotifOpen(false)}>
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="tb-divider" />

        {/* Profile Menu */}
        <div className="tb-profile-wrap" ref={profileRef}>
          <button
            className={`tb-profile-btn ${profileOpen ? "tb-profile-btn--open" : ""}`}
            onClick={() => { setProfileOpen((p) => !p); setNotifOpen(false); }}
          >
            <div className={`tb-avatar tb-avatar--${userRole}`}>{initials}</div>
            <div className="tb-profile-info">
              <span className="tb-profile-name">{displayName}</span>
              <span className="tb-profile-tag">{userRole}</span>
            </div>
            <ChevronDown size={13} className={`tb-chevron ${profileOpen ? "tb-chevron--open" : ""}`} />
          </button>

          {profileOpen && (
            <div className="tb-dropdown tb-profile-panel">
              <div className="tb-profile-top">
                <div className={`tb-avatar tb-avatar--lg tb-avatar--${userRole}`}>{initials}</div>
                <div>
                  <p className="tb-profile-panel-name">{displayName}</p>
                  <p className="tb-profile-panel-role">
                    {userRole === "admin" ? "🛡 Administrator" : "🎓 Student"}
                  </p>
                </div>
              </div>

              <div className="tb-profile-menu">
                <button
                  className="tb-profile-item"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate(userRole === "admin" ? "/admin/profile" : "/student/profile");
                  }}
                >
                  <User size={14} />
                  <span>My Profile</span>
                </button>
                <button
                  className="tb-profile-item"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate(userRole === "admin" ? "/admin/settings" : "/student/settings");
                  }}
                >
                  <Settings size={14} />
                  <span>Settings</span>
                </button>
              </div>

              <div className="tb-profile-footer">
                <button
                  className="tb-logout-btn"
                  onClick={() => {
                    setProfileOpen(false);
                    localStorage.removeItem("user");
                    navigate("/login");
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}