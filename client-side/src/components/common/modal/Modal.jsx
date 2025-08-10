import PropTypes from "prop-types";
import { FaTimes } from "react-icons/fa";
import { useState, useEffect } from "react";

/**
 * Empty modal component that displays a modal dialog with a close button.
 *
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be displayed inside the modal.
 * @param {Function} props.onClose - The function to be called when the modal is closed.
 * @param {Boolean} props.showCloseButton - Flag to show or hide the close button.
 * @returns {JSX.Element} The rendered modal component.
 */
const Modal = ({
  children,
  onClose = () => {},
  showCloseButton = true,
  className,
}) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      {/* Overlay background */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-10"
        onClick={handleClose}
      ></div>

      <div
        className={`
          ${className}
          bg-white rounded-xl shadow-xl
          min-w-140 md:min-w-[550px] w-fit h-fit z-20
          transform transition-transform duration-300
        `}
      >
        {showCloseButton && (
          <div className="flex justify-end p-2">
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={handleClose}
            >
              <FaTimes />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

Modal.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func,
  showCloseButton: PropTypes.bool,
  className: PropTypes.string,
};

export default Modal;
