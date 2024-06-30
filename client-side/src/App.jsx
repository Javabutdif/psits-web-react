// src/App.js
import React from "react";
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
import Login from "./pages/Login";
import Officers from "./pages/Officers";
import Register from "./pages/Register";
import Developers from "./pages/Developers";
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
import ForgotPassword from "./pages/ForgotPassword.jsx";

function App() {
  return (
    <Router>
      <div className="App">
        <ConditionalNavbar />

        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<Home />} />
          <Route path="/officers" element={<Officers />} />
          <Route path="/register" element={<Register />} />
          <Route path="/developers" element={<Developers />} />
          <Route
            path="/adminDashboard"
            element={<PrivateRouteAdmin element={AdminDashboard} />}
          />
          <Route
            path="/membershipRequest"
            element={<PrivateRouteAdmin element={MembershipRequest} />}
          />
          <Route
            path="/membershipRenewal"
            element={<PrivateRouteAdmin element={MembershipRenewal} />}
          />
          <Route
            path="/membershipHistory"
            element={<PrivateRouteAdmin element={MembershipHistory} />}
          />
          <Route
            path="/merchandise"
            element={<PrivateRouteAdmin element={Merchandise} />}
          />
          <Route
            path="/merchandiseHistory"
            element={<PrivateRouteAdmin element={MerchandiseHistory} />}
          />
          <Route
            path="/merchandiseOrders"
            element={<PrivateRouteAdmin element={MerchandiseOrders} />}
          />
          <Route
            path="/viewStudents"
            element={<PrivateRouteAdmin element={ViewStudents} />}
          />
          <Route
            path="/editStudent"
            element={<PrivateRouteAdmin element={EditStudent} />}
          />
          <Route
            path="/studentDashboard"
            element={<PrivateRouteStudent element={StudentDashboard} />}
          />
          <Route
            path="/studentMerchandise"
            element={<PrivateRouteStudent element={StudentMerchandise} />}
          />
          <Route
            path="/studentHistory"
            element={<PrivateRouteStudent element={StudentHistory} />}
          />
          <Route
            path="/studentOrders"
            element={<PrivateRouteStudent element={StudentOrders} />}
          />
          <Route path="/adminRegister" element={<AdminRegister />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
        </Routes>
      </div>
    </Router>
  );
}
function ConditionalNavbar() {
  const location = useLocation();

  if (
    location.pathname.startsWith("/adminDashboard") ||
    location.pathname.startsWith("/membershipRequest") ||
    location.pathname.startsWith("/membershipRenewal") ||
    location.pathname.startsWith("/membershipHistory") ||
    location.pathname.startsWith("/merchandise") ||
    location.pathname.startsWith("/merchandiseHistory") ||
    location.pathname.startsWith("/merchandiseOrders") ||
    location.pathname.startsWith("/viewStudents") ||
    location.pathname.startsWith("/editStudent")
  ) {
    return <NavbarAdmin />;
  } else if (
    location.pathname.startsWith("/studentDashboard") ||
    location.pathname.startsWith("/studentMerchandise") ||
    location.pathname.startsWith("/studentHistory") ||
    location.pathname.startsWith("/studentOrders")
  ) {
    return ( <NavbarStudent />  );
  } else if (
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register") ||
    location.pathname.startsWith("/officers") ||
    location.pathname.startsWith("/developers") ||
    location.pathname.startsWith("/")
  ) {
    return <Navbar />;
  }
}
export default App;
