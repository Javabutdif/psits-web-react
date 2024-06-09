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
import Home from "./pages/Home";
import Login from "./pages/Login";
import Officers from "./pages/Officers";
import Register from "./pages/Register";
import Developers from "./pages/Developers";
import AdminDashboard from "./Admin/AdminDashboard";
import MembershipRequest from "./Admin/MembershipRequest";
import MembershipHistory from "./Admin/MembershipHistory";
import MembershipRenewal from "./Admin/MembershipRenewal";
import Merchandise from "./Admin/Merchandise";
import MerchandiseHistory from "./Admin/MerchandiseHistory";
import MerchandiseOrders from "./Admin/MerchandiseOrders";
import AdminRegister from "./pages/AdminRegister";
import PrivateRouteAdmin from "./Authentication/PrivateRouteAdmin";

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
          <Route path="/adminRegister" element={<AdminRegister />} />
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
    location.pathname.startsWith("/merchandiseOrders")
  ) {
    return <NavbarAdmin />;
  } else if (
    location.pathname.startsWith("/home") ||
    location.pathname.startsWith("/developers") ||
    location.pathname.startsWith("/officers") ||
    location.pathname.startsWith("/adminRegister")
  ) {
    return <Navbar />;
  } else {
    return <Navbar />;
  }
}
export default App;
