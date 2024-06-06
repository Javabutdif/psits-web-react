import React from "react";
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "../App.css";

function AdminDashboard() {
  return (
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-4 mb-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Orders</h5>
              <p class="card-text">This is some content for orders.</p>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Membership Revenue</h5>
              <p class="card-text">
                <strong>Php </strong>{" "}
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Merchandise Revenue</h5>
              <p class="card-text">
                <strong> Php </strong>{" "}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AdminDashboard;
