import React, { useState } from "react";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    // TODO: handle submission
    e.preventDefault();

    console.log("Submitted with email:", email);
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card mt-5 border-0">
            <div
              className="card-body text-white rounded-4"
              style={{ backgroundColor: "#074873" }}
            >
              <h3 className="card-title text-center mb-4">Forgot Password</h3>
              <form onSubmit={handleSubmit} className="px-4">
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="text-center my-4">
                  <button
                    type="submit"
                    className="btn btn-outline-light p-2 px-4"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
