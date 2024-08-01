import React, { forwardRef } from "react";
import logo from "../../assets/images/psits-logo.png";
import "../../App.css";
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
    },
    ref
  ) => (
    <div ref={ref} className=" hidden-on-screen container mx-3">
      <div className="flex flex-row mt-4 ">
        <img className="h-20 w-20 mb-4 " src={logo} alt="Logo" />
        <div className="flex flex-col ms-3 text-center">
          <h1 className="text-2xl">Official</h1>
          <h1 className="text-2xl">Receipt</h1>
        </div>
      </div>
      <p className="mb-2">
        <b>Name: </b>
        {name}
      </p>
      <p className="mb-2">
        <b>Course & Year: </b> {course} - {year}
      </p>
      <br></br>
      ---------------------
      <p className="mb-2">
        <b>Item: </b>{" "}
        {type === "Membership" || type === "Renewal" ? type : product_name} ₱
        {itemTotal}
      </p>
      <p className="mb-2">
        <b>Qty: </b> {qty} ------------ ₱{total}
      </p>
      <br></br>
      <br></br>
      ---------------------
      <p className="font-bold">
        <b>Total:</b> {total}
      </p>
      <></>
      <p className="font-bold">
        <b>Cash: </b> ₱{cash}
      </p>
      <p className="font-bold">
        <b>Change: </b> ₱{cash - total}
      </p>
      <br></br>
      <h2 className="text-2xl">{reference_code}</h2>
      <p className="mb-2 text-xs">
        <b>Processed By:</b> {admin}
      </p>
    </div>
  )
);

export default Receipt;
