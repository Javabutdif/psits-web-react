import React from "react";
import axios from "axios";
import backendConnection from "../../api/backendApi";

function ApproveModal({ onCancel }) {
  const [formData, setFormData] = useState({
    rfid: "",
    money: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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
            <p>
              <strong>RFID Number:</strong>
              <input
                value={formData.rfid}
                className=" form-control"
                type="number"
                onChange={handleChange}
                required
              />
            </p>
            <p>
              <strong>Money:</strong>
              <input
                value={formData.money}
                className=" form-control"
                type="number"
                onChange={handleChange}
                required
              />
            </p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button type="button" className="btn btn-success">
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApproveModal;
