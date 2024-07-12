import React from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

function Breadcrumb({ items }) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index !== items.length - 1 ? (
              <>
                <Link
                  to={item.path}
                  className="text-base font-normal font-segoe text-blue"
                >
                  {item.label}
                </Link>
                <IoIosArrowForward className="mx-2 text-[#B7B7B7]" size={25} />
              </>
            ) : (
              <Link
                to={item.path}
                className="text-base font-normal font-segoe text-blue"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
