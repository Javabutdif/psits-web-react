import React, { forwardRef } from "react";
import logo from "../../assets/images/psits-logo.png";
import "../../App.css";

const Receipt = forwardRef(({ name, id_number, course, year, admin }, ref) => (
  <div className="text-center">
    <h1>Receipt</h1>
    <img className="h-50 w-50 pb-4" src={logo} alt="Logo" />
    <p className="receipt-p">
      <b>ID Number:</b> {id_number}{" "}
    </p>
    <p className="receipt-p">
      <b>Student:</b> {name}{" "}
    </p>
    <p className="receipt-p">
      <b>Course:</b> {course}
    </p>
    <p className="receipt-p">
      <b>Year:</b> {year}
    </p>
    <p className="receipt-p">
      <b>Type:</b> Membership
    </p>
    <p className="receipt-p">
      <b>Processed By:</b> {admin}
    </p>
    <hr></hr>
    <p>
      <b>Total:</b> ₱ 50.00
    </p>
  </div>
));

export default Receipt;
