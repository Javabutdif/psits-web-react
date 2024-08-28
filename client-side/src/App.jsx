import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import LandingLayout from "./components/layout/LandingLayout";
import AdminLayout from "./components/layout/AdminLayout";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Faculty from "./pages/Faculty";
import Team from "./pages/Team";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRegister from "./pages/admin/AdminRegister";
import Membership from "./pages/admin/Membership";
import Merchandise from "./pages/admin/Merchandise";
import Inventory from "./pages/admin/Inventory";
import Orders from "./pages/admin/Orders";
import Reports from "./pages/admin/Reports";
import Resources from "./pages/admin/Resources";
import Settings from "./pages/Settings";
import MembershipRequest from "./pages/admin/MembershipRequest";
import MembershipHistory from "./pages/admin/MembershipHistory";
import Delete from "./pages/admin/Delete";
import Renewal from "./pages/admin/Renewal";
import Product from "./pages/admin/Product";
import EditProduct from "./pages/admin/EditProduct";

import Login from "./pages/authentication/Login";
import Register from "./pages/authentication/Register";

import PrivateRouteAdmin from "./authentication/privateRouteAdmin";
import NotFound from "./components/common/NotFound";
import Profile from "./pages/admin/Profile";

import ForgotPassword from "./pages/authentication/ForgotPassword";
import EmailVerification from "./pages/authentication/EmailVerification";
import OTPVerifier from "./pages/authentication/OtpVerifier";
import ResetPassword from "./pages/authentication/ResetPassword";
import StudentLayout from "./components/layout/StudentLayout";
import StudentDashboard from "./pages/students/StudentDashboard";
import StudentHistory from "./pages/students/StudentHistory";
import StudentMerchandise from "./pages/students/StudentMerchandise";
import StudentOrders from "./pages/students/StudentOrders";
import ProductDetail from "./pages/students/ProductDetail";
import PrivateRouteStudent from "./authentication/privateRouteStudent";
import AllMembers from "./pages/admin/membership/AllMembers";
import StudentCart from "./pages/students/StudentCart";

import PaidOrders from "./pages/admin/orders/PaidOrders";
import PendingOrders from "./pages/admin/orders/PendingOrders";
import StudentPaidOrders from "./pages/students/orders/PaidOrders";
import StudentPendingOrder from "./pages/students/orders/PendingOrders";
import Community from "./pages/Community";
import Events from "./pages/Events";
import Resouces from "./pages/students/Resouces";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingLayout />}>
          <Route index element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/event" element={<Events />} />
          <Route path="/community" element={<Community />} />
        </Route>
        <Route
          path="/admin/"
          element={<PrivateRouteAdmin element={AdminLayout} />}
        >
          <Route
            path="dashboard"
            element={<PrivateRouteAdmin element={AdminDashboard} />}
          />
          <Route
            path="register"
            element={<PrivateRouteAdmin element={AdminRegister} />}
          />
          <Route
            path="membership/"
            element={<PrivateRouteAdmin element={Membership} />}
          >
            <Route index element={<PrivateRouteAdmin element={AllMembers} />} />
            <Route
              path="request"
              element={<PrivateRouteAdmin element={MembershipRequest} />}
            />
            <Route
              path="renewal"
              element={<PrivateRouteAdmin element={Renewal} />}
            />
            <Route
              path="delete"
              element={<PrivateRouteAdmin element={Delete} />}
            />
            <Route
              path="history"
              element={<PrivateRouteAdmin element={MembershipHistory} />}
            />
          </Route>

          <Route
            path="merchandise/"
            element={<PrivateRouteAdmin element={Merchandise} />}
          >
            <Route
              path="product"
              element={<PrivateRouteAdmin element={Product} />}
            >
              <Route
                path="edit"
                element={<PrivateRouteAdmin element={EditProduct} />}
              />
            </Route>
          </Route>

          <Route
            path="inventory"
            element={<PrivateRouteAdmin element={Inventory} />}
          />
          <Route path="orders" element={<PrivateRouteAdmin element={Orders} />}>
            <Route
              index
              element={<PrivateRouteAdmin element={PendingOrders} />}
            />
            <Route
              path="paid"
              element={<PrivateRouteAdmin element={PaidOrders} />}
            />
          </Route>
          <Route
            path="reports"
            element={<PrivateRouteAdmin element={Reports} />}
          />
          <Route
            path="resources"
            element={<PrivateRouteAdmin element={Resources} />}
          />
          <Route
            path="settings"
            element={<PrivateRouteAdmin element={Settings} />}
          />
          <Route
            path="profile"
            element={<PrivateRouteAdmin element={Profile} />}
          ></Route>
        </Route>

        <Route
          path="/student/"
          element={<PrivateRouteStudent element={StudentLayout} />}
        >
          <Route
            path="cart"
            element={<PrivateRouteStudent element={StudentCart} />}
          />
          <Route
            path="dashboard"
            element={<PrivateRouteStudent element={StudentDashboard} />}
          ></Route>
          <Route
            path="history"
            element={<PrivateRouteStudent element={StudentHistory} />}
          />
          <Route
            path="resources"
            element={<PrivateRouteStudent element={Resouces} />}
          />
          <Route
            path="shop"
            element={<PrivateRouteStudent element={StudentHistory} />}
          />
          <Route
            path="merchandise"
            element={<PrivateRouteStudent element={StudentMerchandise} />}
          />

          <Route
            path="merchandise/:id"
            element={<PrivateRouteStudent element={ProductDetail} />}
          />

          <Route
            path="orders"
            element={<PrivateRouteStudent element={StudentOrders} />}
          >
            <Route
              index
              element={<PrivateRouteStudent element={StudentPendingOrder} />}
            />
            <Route
              path="paid"
              element={<PrivateRouteStudent element={StudentPaidOrders} />}
            />
          </Route>

          <Route path="resources" />
          <Route
            path="settings"
            element={<PrivateRouteStudent element={Settings} />}
          />

          <Route
            path="profile"
            element={<PrivateRouteStudent element={Profile} />}
          ></Route>
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/email-verification/:email"
          element={<EmailVerification />}
        />
        <Route path="/otp-verify" element={<OTPVerifier />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
