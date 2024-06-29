import React, { useState } from "react";
import axios from "axios";
import backendConnection from "../../api/backendApi";
import { getAdminName } from "../../authentication/localStorage";

function ApproveModal({ id_number, onCancel, onSubmit }) {
  const [formData, setFormData] = useState({
    id_number: id_number,
    rfid: "",
    money: "",
    admin: getAdminName(),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      if (formData.rfid === "") {
        formData.rfid = "N/A";
      }
      const response = await fetch(
        `${backendConnection()}/api/approve-membership`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();

      if (response.ok) {
        console.log("success");
        onSubmit();
      } else {
        console.log("Error jud");
      }
    } catch (error) {
      console.error("Error submitting form", error);
    }
  };

  return (
    <div className="modal show" style={{ display: "block" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Enter Student RFID</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">
                <strong>RFID Number:</strong>
              </label>
              <input
                value={formData.rfid}
                name="rfid"
                className="form-control"
                type="number"
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                <strong>Money:</strong>
              </label>
              <input
                value={formData.money}
                name="money"
                className="form-control"
                type="number"
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSubmit}
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApproveModal;
