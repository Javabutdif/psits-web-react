import React from "react";
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "../App.css";
import DataTable from "react-data-table-component";
import BackendConnection from "../api/BackendApi";

function MembershipRequest() {
  const [data, setData] = useState([]);

  // Fetch data from an API or any other source
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BackendConnection()}/api/students`, {
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
    };

    fetchData();
  }, []);

  // Define columns for the DataTable
  const columns = [
    {
      name: "ID",
      selector: (row) => row.id,
      sortable: true,
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
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
  ];
  return (
    <div>
      <h1 className="text-center">Membership Request</h1>
      <DataTable
        title="Student List"
        columns={columns}
        data={data}
        pagination
      />
    </div>
  );
}

export default MembershipRequest;
