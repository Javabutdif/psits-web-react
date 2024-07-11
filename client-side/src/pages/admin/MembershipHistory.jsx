import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "../../App.css";
import under from "../../assets/images/under.jfif";
import { InfinitySpin } from "react-loader-spinner";
import backendConnection from "../../api/backendApi";

function MembershipHistory() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${backendConnection()}/api/history`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const columns = [
    {
      name: "ID",
      selector: (row) => row.id_number,
      sortable: true,
    },

    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },

    {
      name: "Course",
      selector: (row) => row.course,
      sortable: true,
    },
    {
      name: "Year",
      selector: (row) => row.year,
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) => row.date,
      sortable: true,
    },
    {
      name: "Admin",
      selector: (row) => row.admin,
      sortable: true,
    },
  ];

  return (
    <div className="text-center ">
      <h1 className="text-center mt-5">History</h1>
      {isLoading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "60vh" }}
        >
          <InfinitySpin
            visible={true}
            width="200"
            color="#0d6efd"
            ariaLabel="infinity-spin-loading"
          />
        </div>
      ) : (
        <DataTable
          className="table table-responsive"
          title="Student List"
          columns={columns}
          data={data}
          pagination
        />
      )}
    </div>
  );
}

export default MembershipHistory;
