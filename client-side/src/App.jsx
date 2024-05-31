import React, { useState } from "react";

import ListGroup from "./components/ListGroup";
import Navbar from "./components/Navbar";
import Login from "./components/Login";

function App() {
  return (
    <div>
      <Navbar></Navbar>
      <Login></Login>
    </div>
  );
}

export default App;
