import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Bookmark,
  BarChart3,
  User,
  LogOut,
  CreditCard,
  Repeat,
} from "lucide-react";

export default function Sidebar({ userRole }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>{userRole === "admin" ? "Admin Panel" : "Student Panel"}</h2>
      </div>

      <nav>
        <ul>
          {userRole === "admin" ? (
            <>
              <li className={isActive("/admin/dashboard") ? "active" : ""}>
                <Link to="/admin/dashboard">
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
              </li>

              <li className={isActive("/admin/books") ? "active" : ""}>
                <Link to="/admin/books">
                  <BookOpen size={18} /> Manage Books
                </Link>
              </li>

              <li className={isActive("/admin/students") ? "active" : ""}>
                <Link to="/admin/students">
                  <Users size={18} /> Students
                </Link>
              </li>

              <li className={isActive("/admin/reservations") ? "active" : ""}>
                <Link to="/admin/reservations">
                  <Bookmark size={18} /> Reservations
                </Link>
              </li>

              <li className={isActive("/admin/borrows") ? "active" : ""}>
                <Link to="/admin/borrows">
                  <Repeat size={18} /> Borrows & Returns
                </Link>
              </li>

              <li className={isActive("/admin/fines") ? "active" : ""}>
                <Link to="/admin/fines">
                  <CreditCard size={18} /> Fine Management
                </Link>
              </li>

              <li className={isActive("/admin/reports") ? "active" : ""}>
                <Link to="/admin/reports">
                  <BarChart3 size={18} /> Reports
                </Link>
              </li>

              <li>
                <Link to="/login">
                  <LogOut size={18} /> Logout
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className={isActive("/student/dashboard") ? "active" : ""}>
                <Link to="/student/dashboard">
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
              </li>

              <li className={isActive("/student/search") ? "active" : ""}>
                <Link to="/student/books">
                  <BookOpen size={18} /> Search Books
                </Link>
              </li>

              <li className={isActive("/student/borrows") ? "active" : ""}>
                <Link to="/student/borrows">
                  <Bookmark size={18} /> Borrowed
                </Link>
              </li>

              <li className={isActive("/student/reservations") ? "active" : ""}>
                <Link to="/student/reservations">
                  <Users size={18} /> Reservations
                </Link>
              </li>

              <li className={isActive("/student/fines") ? "active" : ""}>
                <Link to="/student/fines">
                  <CreditCard size={18} /> My Fines
                </Link>
              </li>

              <li className={isActive("/student/profile") ? "active" : ""}>
                <Link to="/student/profile">
                  <User size={18} /> Profile
                </Link>
              </li>

              <li>
                <Link to="/login">
                  <LogOut size={18} /> Logout
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
}
