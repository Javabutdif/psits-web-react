import React, { useState } from "react";
import FormButton from "../../forms/FormButton";
import { financeAndAdminConditionalAccess } from "../../../components/tools/clientTools";

const actionTypes = Object.freeze({
  Edit: "EDIT",
  Delete: "DELETE",
  Request_Membership: "REQUEST",
  Renew_Membership: "RENEW",
  Change_Password: "CHANGE",
  Membership_History: "HISTORY",
  Suspend: "SUSPEND",
});

const labelToAction = Object.freeze({
  Edit: "Edit",
  Delete: "Delete",
  Request_Membership: "Request Membership",
  Renew_Membership: "Renew Membership",
  Change_Password: "Change Password",
  Membership_History: "Membership History",
  Suspend: "Suspend",
});

const iconsStyle = (type) => {
  switch (type.toLowerCase()) {
    case "edit":
      return <i className="fas fa-edit" />;
    case "delete":
      return <i className="fas fa-trash-alt" />;
    case "suspend":
      return <i className="fas fa-trash-alt" />;
    case "request_membership":
      return <i className="fas fa-paper-plane" />;
    case "renew_membership":
      return <i className="fas fa-paper-plane" />;
    case "change_password":
      return <i className="fas fa-key" />;
    case "membership_history":
      return <i className="fas fa-info-circle" />;
    default:
      return null;
  }
};

const OptionModal = ({ onClose, information, onAction, actionKey }) => {
  const handlePickAction = (action) => {
    actionKey(action);
    onClose();
  };
  const [isActive, setIsActive] = useState(
    information.membershipStatus === "ACTIVE" ||
      information.membershipStatus === "RENEWED"
  );

  const name = React.useState(
    information.first_name
      ? `${information.first_name} ${information.last_name}`
      : information.name
  );

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backdropFilter: "blur(6px)",
        backgroundColor: "rgba(0,0,0,0.3)",
      }}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4">Options ( {name} )</h2>
        <div className="mb-4 flex flex-col space-y-2 ">
          {onAction &&
            onAction.label
              .filter(
                (action) =>
                  financeAndAdminConditionalAccess() ||
                  action !== "Request_Membership"
              )
              .map((action, index) => {
                const isActionActive =
                  isActive &&
                  (action === "Request_Membership" ||
                    action === "Renew_Membership");

                return (
                  <FormButton
                    type="button"
                    disabled={isActionActive}
                    text={
                      isActionActive ? "Already Active" : labelToAction[action]
                    }
                    key={index}
                    onClick={() => handlePickAction(actionTypes[action])}
                    icon={iconsStyle(action)}
                    styles={`flex items-center space-x-2 rounded-md px-3 py-1.5 transition duration-150 focus:outline-none focus:ring-2 ${
                      isActionActive
                        ? "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400"
                    }`}
                    textClass={isActionActive ? "text-white" : "text-gray-800"}
                    whileHover={{ scale: 1.02, opacity: 0.95 }}
                    whileTap={{ scale: 0.98, opacity: 0.9 }}
                  />
                );
              })}
        </div>
      </div>
    </div>
  );
};

export default OptionModal;
