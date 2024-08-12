import React, { forwardRef } from "react";
import logo from "../../assets/images/psits-logo.png";
import "../../App.css";
import { format } from "date-fns";

export const splitName = ({ admin }) => {
  if (!admin || typeof admin !== "string") {
    return "Unknown";
  }

  const words = admin.split(" ");
  let fullName = "";

  for (let i = 0; i < words.length - 1; i++) {
    fullName += words[i].charAt(0) + ".";
  }
  fullName += " " + words[words.length - 1];

  return fullName;
};

const Receipt = forwardRef(
  (
    {
      name,
      reference_code,
      cash,
      type,
      course,
      year,
      product_name,
      batch,
      size,
      variation,
      admin,
      qty,
      itemTotal,
      total,
      reprint,
    },
    ref
  ) => (
    <div ref={ref} className="container mx-3">
      <div className="flex flex-row mt-4 items-center">
        <img className="h-20 w-15 mb-4" src={logo} alt="Logo" />
        <div className="flex flex-col ms-3 text-center">
          <h1 className="text-2xl">Official</h1>
          <h1 className="text-2xl">Receipt</h1>
        </div>
      </div>
    <h6 className="text-sm font-bold ps-1">University of Cebu Main Campus</h6>
     <p className="text-sm pb-7 ps-1">Sanciangko Street Cebu City, 6000</p>
   
 
      
    <div className="text-base">
    <p className="mb-2 ">
        <b>Name: </b>
        {name}
      </p>
      <p className="mb-2 ">
        <b>Course & Year: </b> {course} - {year}
      </p>
      <hr className="my-2 " />
      <p className="mb-2 ">
        <b>Item: </b>
        {type === "Membership" || type === "Renewal" ? type : product_name}
      </p>
      <p className="mb-2">
        <b>Qty: </b> {qty} <span className="float-right">₱{total}</span>
      </p>
      <p className="mb-2">
        <b>Sub-total: </b> {itemTotal === undefined ? "" : "₱" + `${itemTotal}`}
      </p>
      <hr className="my-2" />
      {type === "Order" && (
        <>
          {batch && (
            <p className="mb-2">
              <b>Batch: </b> {batch}
            </p>
          )}
          {size && (
            <p className="mb-2">
              <b>Size: </b> {size}
            </p>
          )}
          {variation && (
            <p className="mb-2">
              <b>Variation: </b> {variation}
            </p>
          )}
        </>
      )}
      {reprint === true && (
        <p className="mb-2 text-sm">
          <b>Type: </b>
          Copy
        </p>
      )}
      <hr className="my-2" />
      <p ><b>Total:</b> ₱{total}</p>
      <p ><b>Cash:</b> ₱{cash}</p>
      <p ><b>Change:</b> ₱{cash - total}</p>
      <br />
      <h2 className="text-2xl">{reference_code}</h2>
      <p className="mb-2 text-lg">
        <b>Date: </b>
        {format(new Date(), "MMMM d, yyyy")}
      </p>

      <p className="mb-2 text-lg">
        <b>Managed by: </b>
        {splitName({ admin })}
      </p>
    </div>
     
    </div>
  )
);

export default Receipt;
