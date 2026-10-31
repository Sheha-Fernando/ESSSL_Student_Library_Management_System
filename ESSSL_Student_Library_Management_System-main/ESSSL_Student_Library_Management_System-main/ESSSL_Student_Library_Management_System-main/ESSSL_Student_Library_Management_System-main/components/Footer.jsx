import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import "../styles/dashboard.css";

export default function Footer() {
  return (
    <footer className="dashboard-footer">
      <div className="footer-container">

        {/* About */}
        <div className="footer-section">
          <h3>About the Library</h3>
          <p>
            Our mission is to provide students with seamless access to books,
            academic materials, and digital resources, supporting learning,
            research, and lifelong education.
          </p>

          {/* Social Media */}
          <div className="footer-social">
            <a href="#" title="Facebook"><Facebook size={18} /></a>
            <a href="#" title="Instagram"><Instagram size={18} /></a>
            <a href="#" title="LinkedIn"><Linkedin size={18} /></a>
            <a href="#" title="Twitter"><Twitter size={18} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/aboutus">About Us</a></li>
            <li><a href="/contactus">Contact Us</a></li>
            <li><a href="/donate">Donate</a></li>
            <li><a href="/student/reservations">My Reservations</a></li>
            <li><a href="/student/fines">My Fines</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h3>Contact</h3>

          <div className="footer-contact">
            <Mail size={16} />
            <span>info@library.edu</span>
          </div>

          <div className="footer-contact">
            <Phone size={16} />
            <span>+94 76 052 5273</span>
          </div>

          <div className="footer-contact">
            <MapPin size={16} />
            <span>123 University Street, Colombo, Sri Lanka</span>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Student Library Management System · ESSSL Institute · All Rights Reserved
      </div>
    </footer>
  );
}