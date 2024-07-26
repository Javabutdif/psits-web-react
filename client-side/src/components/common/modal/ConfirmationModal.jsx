import React from "react";
import {
  ConfirmActionType,
  ConfirmActionWords,
} from "../../../enums/commonEnums.js";
import { capitalizeFirstLetter } from "../../../utils/stringUtils.js";

function ConfirmationModal({ confirmType, onConfirm, onCancel }) {
  let confirmTypeWord = ConfirmActionWords[confirmType];

  const confirmButtonColor =
    confirmType === ConfirmActionType.DELETION
      ? "bg-red-500 hover:bg-red-600"
      : "bg-green-500 hover:bg-green-600";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h5 className="text-lg font-semibold">Confirm {confirmType}</h5>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close"
            onClick={onCancel}
          >
            &times;
          </button>
        </div>
        <div className="p-4">
          <p>Are you sure you want to {confirmTypeWord} this student?</p>
        </div>
        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            type="button"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-white rounded ${confirmButtonColor}`}
            onClick={onConfirm}
          >
            {capitalizeFirstLetter(confirmTypeWord)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
