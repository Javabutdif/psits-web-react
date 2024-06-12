import React from "react";

function ConfirmationModal({ formData, onSubmit, onCancel }) {
  return (
    <div className="modal show" style={{ display: "block" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirm Your Details</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
            ></button>
          </div>
          <div className="modal-body">
            <p>
              <strong>ID Number:</strong> {formData.id_number}
            </p>
            <p>
              <strong>First Name:</strong> {formData.first_name}
            </p>
            <p>
              <strong>Middle Name:</strong> {formData.middle_name}
            </p>
            <p>
              <strong>Last Name:</strong> {formData.last_name}
            </p>
            <p>
              <strong>Email:</strong> {formData.email}
            </p>
            <p>
              <strong>Course:</strong> {formData.course}
            </p>
            <p>
              <strong>Year:</strong> {formData.year}
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
            <button
              type="button"
              className="btn btn-primary"
              onClick={onSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
