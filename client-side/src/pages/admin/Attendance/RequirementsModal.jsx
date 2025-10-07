import Modal from "../../../components/common/modal/Modal"

export default function RequirementsModal({ setRequirementsModalOpen = true }) {
    return (
        <Modal
          onClose={() => setRequirementsModalOpen(false)}
          showCloseButton={true}
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Attendee Requirements
            </h3>
            <div className="space-y-3">
              {[
                { label: "Insurance", value: selectedRequirements.insurance },
                { label: "Prelim Payment", value: selectedRequirements.prelim_payment },
                { label: "Midterm Payment", value: selectedRequirements.midterm_payment },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-gray-700">{item.label}</span>
                  {item.value ? (
                    <span className="text-green-600 font-medium">✅ Fulfilled</span>
                  ) : (
                    <span className="text-red-600 font-medium">❌ Not Submitted</span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setRequirementsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
    )
}