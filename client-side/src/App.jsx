
import React, { useEffect, useState } from "react";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/common/Navbar";
import NavbarAdmin from "./components/common/NavbarAdmin";
import NavbarStudent from "./components/common/NavbarStudent";
import Home from "./pages/Home";
import Login from "./pages/authentication/Login.jsx";

import Explore from "./pages/Explore.jsx";
import Faculty from "./pages/Faculty.jsx"
import Team from "./pages/Team.jsx"
import Register from "./pages/authentication/Register.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard";
import MembershipRequest from "./pages/admin/MembershipRequest";
import MembershipHistory from "./pages/admin/MembershipHistory";
import MembershipRenewal from "./pages/admin/MembershipRenewal";
import Merchandise from "./pages/admin/Merchandise";
import MerchandiseHistory from "./pages/admin/MerchandiseHistory";
import MerchandiseOrders from "./pages/admin/MerchandiseOrders";
import ViewStudents from "./pages/admin/ViewStudents";
import EditStudent from "./pages/admin/EditStudent";
import AdminRegister from "./pages/admin/AdminRegister.jsx";
import PrivateRouteAdmin from "./authentication/privateRouteAdmin";
import PrivateRouteStudent from "./authentication/privateRouteStudent";
import StudentDashboard from "./pages/students/StudentDashboard.jsx";
import StudentMerchandise from "./pages/students/StudentMerchandise.jsx";
import StudentHistory from "./pages/students/StudentHistory.jsx";
import StudentOrders from "./pages/students/StudentOrders.jsx";
import ForgotPassword from "./pages/authentication/ForgotPassword.jsx";
import EmailVerification from "./pages/authentication/EmailVerification.jsx";
import OTPVerifier from "./pages/authentication/OtpVerifier.jsx";
import ResetPassword from "./pages/authentication/ResetPassword.jsx";

function App() {
  const [role, setRole] = useState("");


  useEffect(() => {

    console.log(role)
  })

  return (
    <Router>
      <div className={`App flex ${role !== 'admin'  ? 'flex-col' : 'flex-row'}`}>
        {/* Pass setRole directly to ConditionalNavbar */}
        <ConditionalNavbar setRole={setRole} role={role}/>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />

          <Route path="/explore"   element={<Explore />} />
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/the-team" element={<Team />} />

          <Route path="/admin-dashboard" element={<PrivateRouteAdmin element={AdminDashboard} />} />
          <Route path="/membership-request" element={<PrivateRouteAdmin element={MembershipRequest} />} />
          <Route path="/membership-renewal" element={<PrivateRouteAdmin element={MembershipRenewal} />} />
          <Route path="/membership-history" element={<PrivateRouteAdmin element={MembershipHistory} />} />
          <Route path="/merchandise" element={<PrivateRouteAdmin element={Merchandise} />} />
          <Route path="/merchandise-history" element={<PrivateRouteAdmin element={MerchandiseHistory} />} />
          <Route path="/merchandise-orders" element={<PrivateRouteAdmin element={MerchandiseOrders} />} />
          <Route path="/viewStudents" element={<PrivateRouteAdmin element={ViewStudents} />} />
          <Route path="/editStudent" element={<PrivateRouteAdmin element={EditStudent} />} />

          <Route path="/student-dashboard" element={<PrivateRouteStudent element={StudentDashboard} />} />
          <Route path="/student-merchandise" element={<PrivateRouteStudent element={StudentMerchandise} />} />
          <Route path="/student-history" element={<PrivateRouteStudent element={StudentHistory} />} />
          <Route path="/student-orders" element={<PrivateRouteStudent element={StudentOrders} />} />
          
          <Route path="/admin-register" element={<AdminRegister />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/otp-verifier" element={<OTPVerifier />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} /> 

        
        </Routes>
      </div>
    </Router>
  );
}

function ConditionalNavbar({ setRole, role }) {

  const location = useLocation();

  useEffect(() => {
    if (
      location.pathname.startsWith("/admin-dashboard") ||
      location.pathname.startsWith("/membership-request") ||
      location.pathname.startsWith("/membership-renewal") ||
      location.pathname.startsWith("/membership-ristory") ||
      location.pathname.startsWith("/merchandise") ||
      location.pathname.startsWith("/merchandise-history") ||
      location.pathname.startsWith("/merchandise-orders") ||
      location.pathname.startsWith("/view-students") ||
      location.pathname.startsWith("/edit-student")
    ) {
      setRole("admin");
    } else if (
      location.pathname.startsWith("/student-dashboard") ||
      location.pathname.startsWith("/student-merchandise") ||
      location.pathname.startsWith("/student-history") ||
      location.pathname.startsWith("/student-orders")
    ) {
      setRole("student");
    } else if (
      location.pathname.startsWith("/the-team") ||
      location.pathname.startsWith("/faculty") ||
      location.pathname.startsWith("/explore") ||
      location.pathname === "/"
    ) {
      setRole("landing");
    } else {
      setRole(""); // Default case, reset role if none of the conditions match
    }
  }, [location.pathname, setRole]);

  // Render the appropriate Navbar based on role
  if (role === "admin") {
    return <NavbarAdmin />;

  } else if (role === "student") {
    return <NavbarStudent />;
  } else if (role === "landing") {
    return <Navbar />;
  } else {
    return null; // Return null to hide the navbar if role is not set
  }
}



export default App;
