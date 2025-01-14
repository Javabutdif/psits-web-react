import React from "react";
import { motion } from "framer-motion";

const TableHeader = ({ columns, sortConfig, handleSort }) => (
  <thead className="hidden md:table-header-group bg-neutral-light text-xs md:text-sm font-medium text-dark border-b border-neutral-medium">
    <tr>
      {columns.map((column, index) => (
        <th
          key={`header-${column.key || index}`}
          className={`p-3 text-left ${
            column.hiddenOnMobile ? "hidden md:table-cell" : ""
          } ${
            column.width || "w-auto"
          } cursor-pointer select-none transition-transform duration-300 ease-in-out`}
          onClick={() => column.sortable && handleSort(column.key)}
          style={{
            transition: "background-color 0.3s ease, box-shadow 0.3s ease",
          }}
        >
          <div className="flex items-center space-x-2">
            <span className="text-dark">{column.label}</span>
            {column.sortable &&
            sortConfig.key === column.key &&
            column.key !== "actions" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <motion.svg
                  width="12"
                  height="12"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  {sortConfig.direction === "asc" ? (
                    <path d="M12 16l-6-6h12l-6 6z" />
                  ) : (
                    <path d="M12 8l6 6H6l6-6z" />
                  )}
                </motion.svg>
              </motion.div>
            ) : (
              column.key === "actions" && ""
            )}
          </div>
        </th>
      ))}
    </tr>
  </thead>
);

export default TableHeader;
