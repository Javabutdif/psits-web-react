import React, { useState, useRef } from "react";
import axios from "axios";
import backendConnection from "../../api/backendApi";
import { getAdminName } from "../../authentication/localStorage";
import { showToast } from "../../utils/alertHelper";
import ReactToPrint from "react-to-print";
import Receipt from "../../components/common/Receipt.jsx";

function ApproveModal({ id_number, course, year, name, onCancel, onSubmit }) {
  const componentRef = useRef();
  const [formData, setFormData] = useState({
    id_number: id_number,
    rfid: "",

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
        showToast("success", "Student Approve");
        onSubmit();
        onCancel();
      } else {
        showToast("error", "Internal Server Error!");

        onSubmit();
        onCancel();
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
            <ReactToPrint
              trigger={() => (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSubmit}
                >
                  Approve
                </button>
              )}
              content={() => componentRef.current}
            />
            <Receipt
              ref={componentRef}
              id_number={formData.id_number}
              course={course}
              year={year}
              name={name}
              admin={getAdminName()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApproveModal;
