import React from "react";
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "../../App.css";

function AdminDashboard() {
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Orders</h5>
              <p className="card-text">This is some content for orders.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Membership Revenue</h5>
              <p className="card-text">
                <strong>Php </strong>{" "}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Merchandise Revenue</h5>
              <p className="card-text">
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
