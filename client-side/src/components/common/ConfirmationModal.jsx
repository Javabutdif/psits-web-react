import React from "react";
import {
  ConfirmActionType,
  ConfirmActionWords,
} from "../../enums/commonEnums.js";
import { capitalizeFirstLetter } from "../../utils/stringUtils.js";

function ConfirmationModal({ confirmType, onConfirm, onCancel }) {
  let confirmTypeWord = ConfirmActionWords[confirmType];

  const confirmButtonColor =
    confirmType === ConfirmActionType.DELETION ? "btn-danger" : "btn-success";

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirm {confirmType}</h5>
            <button
              type="button"
              className="close"
              aria-label="Close"
              onClick={onCancel}
              style={{
                backgroundColor: "transparent",
                border: "none",
                marginLeft: "auto",
              }}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <p>Are you sure you want to {confirmTypeWord} this student?</p>
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
              className={`btn ${confirmButtonColor}`}
              onClick={onConfirm}
            >
              {capitalizeFirstLetter(confirmTypeWord)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
