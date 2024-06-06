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
          <Route path="/adminDashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}
function ConditionalNavbar() {
  const location = useLocation();

  if (location.pathname.startsWith("/adminDashboard")) {
    return <NavbarAdmin />;
  } else if (
    location.pathname.startsWith("/home") ||
    location.pathname.startsWith("/developers") ||
    location.pathname.startsWith("/officers")
  ) {
    return <Navbar />;
  } else {
    return <Navbar />;
  }
}
export default App;
