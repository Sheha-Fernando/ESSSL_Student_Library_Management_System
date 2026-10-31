import { BrowserRouter, Routes, Route } from "react-router-dom";

/* Public Pages */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Donate from "./pages/Donate";
import NotFound from "./pages/NotFound";

/* Student Pages */
import StudentDashboard from "./pages/StudentDashboard";
import StudentBookSearch from "./pages/StudentBookSearch";
import StudentBorrow from "./pages/StudentBorrow";
import StudentReservation from "./pages/StudentReservation";
import StudentFines from "./pages/StudentFines";
import StudentProfile from "./pages/StudentProfile";

/* Admin Pages */
import AdminDashboard from "./pages/AdminDashboard";
import AdminBookManagement from "./pages/AdminBookManagement";
import AdminStudentManagement from "./pages/AdminStudentManagement";
import AdminReservationsManagement from "./pages/AdminReservationsManagement";
import AdminReports from "./pages/AdminReports";
import AdminBorrows from "./pages/AdminBorrows";
import AdminFines from "./pages/AdminFines";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/donate" element={<Donate />} />

        {/* Student */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/books" element={<StudentBookSearch />} />
        <Route path="/student/borrows" element={<StudentBorrow />} />
        <Route path="/student/reservations" element={<StudentReservation />} />
        <Route path="/student/fines" element={<StudentFines />} />
        <Route path="/student/profile" element={<StudentProfile />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/books" element={<AdminBookManagement />} />
        <Route path="/admin/students" element={<AdminStudentManagement />} />
        <Route path="/admin/reservations" element={<AdminReservationsManagement />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/borrows" element={<AdminBorrows />} />
        <Route path="/admin/fines" element={<AdminFines />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
