import TableComponent from "../../../components/Custom/TableComponent";
import ButtonsComponent from "../../../components/Custom/ButtonsComponent";
import { motion } from "framer-motion";
import PromoAddCode from "./PromoAddCode";
import React from "react";
const PromoDashboard = () => {
  const [addModal, setAddModal] = React.useState(false);

  const handleViewAddModal = () => {
    setAddModal(true);
  };

  return (
    <>
      <div>This is Promo Dashboard</div>

      <div>
        <div className="p-2 mb-5">
          <ButtonsComponent>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#0056b3" }} // Hover effect for primary
              whileTap={{ scale: 0.98, backgroundColor: "#003d7a" }} // Active effect for primary
              className="text-sm md:text-base bg-accent text-white flex items-center gap-2 px-5 py-2 border border-neutral-medium rounded-lg shadow-sm hover:shadow-md transition ease-in-out duration-150 focus:outline-none focus:ring-2 focus:ring-highlight"
              onClick={handleViewAddModal}
            >
              <i className="fas fa-plus text-white"></i>
              <span className="font-medium">Add Promo Code</span>
            </motion.button>
          </ButtonsComponent>
        </div>
        {addModal && <PromoAddCode onCancel={() => setAddModal(false)} />}
        <TableComponent />
      </div>
    </>
  );
};

export default PromoDashboard;
