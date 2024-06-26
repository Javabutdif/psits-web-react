import React, { forwardRef } from "react";
import logo from "../../assets/images/psits-logo.png";

const Receipt = forwardRef(({ name, id_number, course, year, admin }, ref) => (
  <div ref={ref} className="text-center">
    <h1>Receipt</h1>
    <img className="h-25 w-25 pb-3" src={logo} alt="Santoya" />
    <p>ID Number: {id_number} </p>
    <p>Student Name: {name} </p>
    <p>Course: {course}</p>
    <p>Year: {year}</p>
    <p>Processed By: {admin}</p>
    <p>Total: 50.00</p>
  </div>
));

export default Receipt;
