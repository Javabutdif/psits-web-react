import React, { forwardRef } from "react";
import logo from "../../assets/images/psits-logo.png";
import "../../App.css";
const Receipt = forwardRef(({ name, id_number, course, year, admin }, ref) => (
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
    ######################
    <p className="mb-2">
      <b>Item: </b> Membership
    </p>
    <p className="mb-2">
      <b>Processed By:</b> {admin}
    </p>
    <hr className="my-4" />
    <p className="font-bold">
      <b>Total:</b> ₱ 50.00
    </p>
  </div>
));

export default Receipt;
