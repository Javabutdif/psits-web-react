import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Login() {
  const [message, setMessage] = useState("");
  const [postResponse, setPostResponse] = useState("");

  useEffect(() => {
    // GET request to the PHP backend
    axios
      .get("/api/data")
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  }, []);

  const handlePost = () => {
    // POST request to the PHP backend
    axios
      .post("http://localhost/psits-web-react/server-side/api.php", {
        data: "Sample data",
      })
      .then((response) => {
        setPostResponse(response.data.received);
        windows.location.href = "/login";
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  };
  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

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
      <h1>GET Response: {message}</h1>
      <button onClick={handlePost}>Send POST Request</button>
      <h1>POST Response: {postResponse}</h1>
    </div>
  );
}
export default Login;
