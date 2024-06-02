import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Login() {
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card mt-5 border-0">
            <div
              className="card-body text-white rounded-4 "
              style={{ backgroundColor: "#074873" }}
            >
              <h3 className="card-title text-center mb-4">Login</h3>
              <form action="Login.php" method="POST" className="px-4">
                <div className="mb-3">
                  <label for="id_number" className="form-label">
                    ID Number
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="id_number"
                    name="id_number"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label for="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    required
                  />
                </div>
                <div className="text-center my-4">
                  <button
                    type="submit"
                    name="submit"
                    className="btn btn-outline-light p-2 px-4"
                  >
                    Login
                  </button>
                  <p className="my-3">
                    Don't have an account?{" "}
                    <Link to="/register">Click Here!</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;
