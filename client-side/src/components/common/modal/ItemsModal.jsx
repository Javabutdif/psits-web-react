// components/common/ItemsModal.js
import React from "react";
import { Dialog } from "@headlessui/react";

const ItemsModal = ({ isOpen, onClose, items }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 flex items-center justify-center z-50"
    >
      <Dialog.Overlay className="fixed inset-0 bg-black/30" />
      <div className="relative bg-white p-6 rounded-lg shadow-lg">
        <Dialog.Title className="text-xl font-semibold mb-4">
          Order Items
        </Dialog.Title>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <i className="fa fa-times" aria-hidden="true"></i>
        </button>
        <ul>
          {items.map((item, index) => (
            <div
              key={index}
              className="text-sm mb-2 p-2 flex flex-row mx-3 gap-10"
            >
              <img src={item.imageUrl1} className="w-16 h-16" />
              <span className="font-medium ms-2">
                {item.product_name}
                <div className="text-xs text-gray-500">{item._id}</div>
              </span>
              <div className="mx-3 mb-2 flex flex-col">
                <span>Price</span>
                <span className="text-xs text-center">₱{item.price}</span>
              </div>
              <div className="mx-3 mb-2 flex flex-col">
                <span>Quantity</span>
                <span className="text-xs text-center">{item.quantity}</span>
              </div>
              <div className="mx-3 mb-2 flex flex-col">
                <span>Variation</span>
                <span className="text-xs text-center">
                  {item.variation ? item.variation : "Null"}
                </span>
              </div>
              <div className="mx-3 mb-2 flex flex-col">
                <span>Size</span>
                <span className="text-xs text-center">
                  {item.sizes ? item.sizes : "Null"}
                </span>
              </div>
              <div className="mx-3 mb-2 flex flex-col">
                <span>Batch</span>
                <span className="text-xs text-center">
                  {item.batch ? item.batch : "Null"}
                </span>
              </div>
              <div className="mx-3 mb-2 flex flex-col">
                <span>Subtotal</span>
                <span className="text-xs text-center">
                  ₱{item.sub_total ? item.sub_total : "Null"}
                </span>
              </div>
            </div>
          ))}
        </ul>
      </div>
    </Dialog>
  );
};

export default ItemsModal;
