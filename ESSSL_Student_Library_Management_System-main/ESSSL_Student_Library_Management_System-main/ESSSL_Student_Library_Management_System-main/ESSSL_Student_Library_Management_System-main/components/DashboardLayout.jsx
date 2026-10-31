import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";
import "../styles/dashboard.css";

export default function DashboardLayout({ children, userRole = "student" }) {
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar userRole={userRole} />

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Topbar */}
        <Topbar userRole={userRole} />

        {/* Page Content */}
        <main className="dashboard-content">{children}</main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
