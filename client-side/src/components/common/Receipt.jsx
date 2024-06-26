import React, { forwardRef } from "react";

const Receipt = forwardRef((props, ref) => (
  <div ref={ref}>
    <h1>Receipt</h1>
    <p>Item 1: $10.00</p>
    <p>Item 2: $15.00</p>
    <p>Total: $25.00</p>
  </div>
));

export default Receipt;
