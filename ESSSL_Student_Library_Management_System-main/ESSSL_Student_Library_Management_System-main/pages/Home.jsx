import { Link } from "react-router-dom";
import "../styles/home.css";

export default function Home() {
  return (
    <div>

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">SLMS</div>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/aboutus">About</Link>
          <Link to="/contactus">Contact Us</Link>
          <Link to="/donate">Donate</Link>
          <Link to="/login">Login</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <h1>Student Library Management System</h1>

        <p>
          A simple and efficient platform to manage books, students,
          borrowing and library activities digitally.
        </p>

        <div className="hero-buttons">
          <Link to="/login">
            <button className="primary-btn">Login</button>
          </Link>

          <Link to="/register">
            <button className="secondary-btn">Register</button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2>System Features</h2>

        <div className="feature-grid">
          <Feature title="Book Management" desc="Manage books easily" />
          <Feature title="Student Management" desc="Manage student accounts" />
          <Feature title="Borrow & Return" desc="Track issued books" />
          <Feature title="Admin Dashboard" desc="Powerful admin controls" />
          <Feature title="Reports" desc="View usage reports" />
          <Feature title="Secure Login" desc="Role-based authentication" />
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        © {new Date().getFullYear()} Student Library Management System | ICBT Campus Colombo
      </footer>

    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="feature-box">
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}
