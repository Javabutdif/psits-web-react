import React, { forwardRef } from "react";
import logo from "../../assets/images/psits-logo.png";
import "../../App.css";
import { format } from "date-fns";

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
          <h1 className="text-2xl">Official </h1>
          <h1 className="text-2xl">Receipt </h1>
        </div>
      </div>
      <h5 className="text-sm font-bold pb-5">University of Cebu Main</h5>

      <p className="mb-2">
        <b>Name: </b>
        {name}
      </p>
      <p className="mb-2">
        <b>Course & Year: </b> {course} - {year}
      </p>
      <hr className="my-2" />
      <p className="mb-2">
        <b>Item: </b>{" "}
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
      <p className="font-bold">Total: ₱{total}</p>
      <p className="font-bold">Cash: ₱{cash}</p>
      <p className="font-bold">Change: ₱{cash - total}</p>
      <br />
      <h2 className="text-2xl">{reference_code}</h2>
      <p className="mb-2 text-s">
        <b>Date: </b>
        {format(new Date(), "MMMM d, yyyy")}
      </p>

      <p className="mb-2 text-xs">
        <b>Processed By: </b> {admin}
      </p>
    </div>
  )
);

export default Receipt;
