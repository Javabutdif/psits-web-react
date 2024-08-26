import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { CSVLink } from "react-csv";
import { membershipHistory, merchandiseAdmin } from "../../api/admin";

const Reports = () => {
  const [membershipData, setMembershipData] = useState([]);
  const [merchandiseData, setMerchandiseData] = useState([]);
  const [filteredMembershipData, setFilteredMembershipData] = useState([]);
  const [filteredMerchandiseData, setFilteredMerchandiseData] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [productNames, setProductNames] = useState([]);
  const [salesData, setSalesData] = useState({});

  const [filterID, setFilterID] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterRFID, setFilterRFID] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterProductName, setFilterProductName] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [filterSize, setFilterSize] = useState("");
  const [filterColor, setFilterColor] = useState("");

  useEffect(() => {
    if (activeTab === 0) {
      fetchMembershipData();
    } else {
      fetchMerchandiseData();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 0) {
      applyFilter(membershipData, setFilteredMembershipData);
    } else {
      applyFilter(merchandiseData, setFilteredMerchandiseData);
      calculateSalesData();
    }
  }, [
    membershipData,
    merchandiseData,
    filterID,
    filterName,
    filterRFID,
    filterCourse,
    filterYear,
    filterDateFrom,
    filterDateTo,
    filterProductName,
    filterBatch,
    filterSize,
    filterColor,
    filterType,
    activeTab,
  ]);

  const fetchMembershipData = async () => {
    try {
      const data = await membershipHistory();
      setMembershipData(data);
      setFilteredMembershipData(data);
    } catch (error) {
      console.error("Error fetching membership data:", error);
    }
  };

  const fetchMerchandiseData = async () => {
    try {
      const data = await merchandiseAdmin();
      const allOrderDetails = data
        ? data.flatMap((order) => order.order_details || [])
        : [];
      const filteredOrderDetails = allOrderDetails.filter(
        (detail) => detail !== undefined
      );
      const allSalesData = data
        ? data.flatMap((sales) => sales.sales_data || [])
        : [];

      setMerchandiseData(filteredOrderDetails);
      setFilteredMerchandiseData(filteredOrderDetails);
      setProductNames(data);
      setSalesData(allSalesData);
    } catch (error) {
      console.error("Error fetching merchandise data:", error);
    }
  };

  const applyFilter = (data, setData) => {
    let filteredData = data;

    if (activeTab === 0) {
      if (filterID) {
        filteredData = filteredData.filter((item) =>
          item.reference_code?.includes(filterID)
        );
      }
      if (filterName) {
        filteredData = filteredData.filter((item) =>
          item.name?.toLowerCase().includes(filterName.toLowerCase())
        );
      }
      if (filterType) {
        filteredData = filteredData.filter((item) =>
          item.type?.toLowerCase().includes(filterType.toLowerCase())
        );
      }
      if (filterRFID) {
        filteredData = filteredData.filter((item) =>
          item.rfid?.includes(filterRFID)
        );
      }
      if (filterCourse) {
        filteredData = filteredData.filter((item) =>
          item.course?.toLowerCase().includes(filterCourse.toLowerCase())
        );
      }
      if (filterYear) {
        filteredData = filteredData.filter((item) =>
          item.year?.includes(filterYear)
        );
      }
      if (filterDateFrom) {
        filteredData = filteredData.filter(
          (item) => new Date(item.date) >= new Date(filterDateFrom)
        );
      }
      if (filterDateTo) {
        filteredData = filteredData.filter(
          (item) => new Date(item.date) <= new Date(filterDateTo)
        );
      }
    } else {
      if (filterID) {
        filteredData = filteredData.filter((item) =>
          item.id_number?.includes(filterID)
        );
      }
      if (filterName) {
        filteredData = filteredData.filter((item) =>
          item.student_name?.toLowerCase().includes(filterName.toLowerCase())
        );
      }
      if (filterProductName) {
        filteredData = filteredData.filter((item) =>
          item.product_name
            ?.toLowerCase()
            .includes(filterProductName.toLowerCase())
        );
      }
      if (filterRFID) {
        filteredData = filteredData.filter((item) =>
          item.rfid?.includes(filterRFID)
        );
      }
      if (filterDateFrom) {
        filteredData = filteredData.filter(
          (item) => new Date(item.order_date) >= new Date(filterDateFrom)
        );
      }
      if (filterDateTo) {
        filteredData = filteredData.filter(
          (item) => new Date(item.order_date) <= new Date(filterDateTo)
        );
      }
      if (filterBatch) {
        filteredData = filteredData.filter(
          (item) => item.batch === Number(filterBatch)
        );
      }

      if (filterSize) {
        filteredData = filteredData.filter((item) =>
          item.size?.includes(filterSize)
        );
      }
      if (filterColor) {
        filteredData = filteredData.filter((item) =>
          item.variation?.includes(filterColor)
        );
      }
    }

    setData(filteredData);
  };

  const calculateSalesData = () => {
    if (activeTab === 1 && filteredMerchandiseData.length) {
      // Create a map to store the aggregated data
      const salesMap = filteredMerchandiseData.reduce((acc, item) => {
        if (!acc[item.product_name]) {
          acc[item.product_name] = { unitsSold: 0, totalRevenue: 0 };
        }
        acc[item.product_name].unitsSold += item.quantity;
        acc[item.product_name].totalRevenue += item.total;
        return acc;
      }, {});

      setSalesData(salesMap);
    } else {
      setSalesData({});
    }
  };

  const handleFilter = () => {
    if (activeTab === 0) {
      applyFilter(membershipData, setFilteredMembershipData);
    } else {
      applyFilter(merchandiseData, setFilteredMerchandiseData);
    }
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setFilterID("");
    setFilterName("");
    setFilterRFID("");
    setFilterCourse("");
    setFilterYear("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterProductName("");
    setFilterBatch("");
    setFilterSize("");
    setFilterColor("");
    setFilterType("");

    if (activeTab === 0) {
      setFilteredMembershipData(membershipData);
    } else {
      setFilteredMerchandiseData(merchandiseData);
    }
  };

  const membershipColumns = [
    {
      name: "Reference Code",
      selector: (row) => row.reference_code,
      sortable: true,
    },
    { name: "ID Number", selector: (row) => row.id_number, sortable: true },
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "RFID", selector: (row) => row.rfid, sortable: true },
    { name: "Course", selector: (row) => row.course, sortable: true },
    { name: "Year", selector: (row) => row.year, sortable: true },
    {
      name: "Date",
      selector: (row) => new Date(row.date).toLocaleString(),
      sortable: true,
    },
    { name: "Type", selector: (row) => row.type, sortable: true },
  ];

  const merchandiseColumns = [
    { name: "Order ID", selector: (row) => row._id, sortable: true },
    {
      name: "Product Name",
      selector: (row) => row.product_name,
      sortable: true,
    },
    { name: "Batch", selector: (row) => row.batch, sortable: true },
    { name: "Size", selector: (row) => row.size, sortable: true },
    { name: "Color", selector: (row) => row.variation, sortable: true },
    { name: "Quantity", selector: (row) => row.quantity, sortable: true },

    { name: "Total", selector: (row) => row.total, sortable: true },
    {
      name: "Order Date",
      selector: (row) => new Date(row.order_date).toLocaleString(),
      sortable: true,
    },
  ];

  const membershipCount = membershipData.filter(
    (data) => data.type === "Membership"
  ).length;
  const renewalCount = membershipData.filter(
    (data) => data.type === "Renewal"
  ).length;

  // Calculate the total revenue
  const membershipRevenue = membershipCount * 50;
  const renewalRevenue = renewalCount * 50;
  return (
    <div className="container mx-auto p-4">
      <Tabs selectedIndex={activeTab} onSelect={(index) => setActiveTab(index)}>
        <TabList>
          <Tab>Membership</Tab>
          <Tab>Merchandise</Tab>
        </TabList>

        <TabPanel>
          {/* Sales Summary for Membership */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Membership Sales Summary</h2>
            <table className="min-w-full bg-gray-100 rounded-lg overflow-hidden shadow-md">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-4 py-2 text-left">
                    Membership Type
                  </th>
                  <th className="border px-4 py-2 text-left">
                    Registered Students
                  </th>
                  <th className="border px-4 py-2 text-left">Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2">Membership</td>
                  <td className="border px-4 py-2">{membershipCount}</td>
                  <td className="border px-4 py-2">
                    ₱{membershipRevenue.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2">Renewal</td>
                  <td className="border px-4 py-2">{renewalCount}</td>
                  <td className="border px-4 py-2">
                    ₱{renewalRevenue.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Membership Tab Content */}
          <div className="flex justify-between items-center mb-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => setIsFilterOpen(true)}
            >
              Filter
            </button>
            <CSVLink
              data={filteredMembershipData.length ? filteredMembershipData : []}
              filename="membership-data.csv"
            >
              <button className="bg-green-500 text-white px-4 py-2 rounded">
                Export CSV
              </button>
            </CSVLink>
          </div>
          <DataTable
            columns={membershipColumns}
            data={filteredMembershipData}
            pagination
          />
        </TabPanel>

        <TabPanel>
          {/* Sales Summary for Merchandise */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">
              Merchandise Sales Summary
            </h2>
            <table className="min-w-full bg-gray-100 rounded-lg overflow-hidden shadow-md">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-4 py-2 text-left">Product Name</th>
                  <th className="border px-4 py-2 text-left">Units Sold</th>
                  <th className="border px-4 py-2 text-left">Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(salesData).map(([productName, data]) => (
                  <tr key={productName}>
                    <td className="border px-4 py-2">{productName}</td>
                    <td className="border px-4 py-2">{data.unitsSold}</td>
                    <td className="border px-4 py-2">
                      ₱{data.totalRevenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Merchandise Tab Content */}
          <div className="flex justify-between items-center mb-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => setIsFilterOpen(true)}
            >
              Filter
            </button>

            <CSVLink
              data={
                filteredMerchandiseData.length ? filteredMerchandiseData : []
              }
              filename="merchandise-data.csv"
            >
              <button className="bg-green-500 text-white px-4 py-2 rounded">
                Export CSV
              </button>
            </CSVLink>
          </div>
          <DataTable
            columns={merchandiseColumns}
            data={filteredMerchandiseData}
            pagination
          />
        </TabPanel>
      </Tabs>

      {isFilterOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-600 bg-opacity-75">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Filter Data</h2>
            <input
              className="border w-full p-2 mb-2"
              placeholder="ID Number"
              value={filterID}
              onChange={(e) => setFilterID(e.target.value)}
            />
            <input
              className="border w-full p-2 mb-2"
              placeholder="Name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
            {activeTab !== 0 && (
              <select
                className="border w-full p-2 mb-2"
                value={filterProductName}
                onChange={(e) => {
                  setFilterProductName(e.target.value);
                  setFilterBatch(""); // Clear the selected batch when product changes
                }}
              >
                <option value="">Select a Product</option>
                {productNames.map((product) => (
                  <option key={product._id} value={product.name}>
                    {product.name}
                  </option>
                ))}
              </select>
            )}
            {activeTab !== 0 && filterProductName && (
              <select
                className="border w-full p-2 mb-2"
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
              >
                <option value="">Select Batch</option>
                {productNames
                  .filter((product) => product.name === filterProductName)
                  .map((product) => (
                    <option key={product.batch} value={product.batch}>
                      {product.batch}
                    </option>
                  ))}
              </select>
            )}

            <input
              className="border w-full p-2 mb-2"
              placeholder="RFID"
              value={filterRFID}
              onChange={(e) => setFilterRFID(e.target.value)}
            />
            {activeTab === 0 && (
              <select
                className="border w-full p-2 mb-2"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Select Type</option>
                <option key="Membership" value="Membership">
                  Membership
                </option>
                <option key="Renewal" value="Renewal">
                  Renewal
                </option>
              </select>
            )}

            <select
              className="border w-full p-2 mb-2"
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
            >
              <option value="">Select Course</option>
              <option key="BSIT" value="BSIT">
                BSIT
              </option>
              <option key="BSCS" value="BSCS">
                BSCS
              </option>
              <option key="ACT" value="ACT">
                ACT
              </option>
            </select>

            <select
              className="border w-full p-2 mb-2"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="">Select Year</option>
              <option key="1" value="1">
                1
              </option>
              <option key="2" value="2">
                2
              </option>
              <option key="3" value="3">
                3
              </option>
              <option key="4" value="4">
                4
              </option>
            </select>
            <div>
              <label>Start Date</label>
              <input
                className="border w-full p-2 mb-2"
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label>End Date</label>
              <input
                className="border w-full p-2 mb-2"
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
              />
            </div>

            <div className="flex justify-between mt-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleClearFilters} // Call the clear function
              >
                Clear
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleFilter}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Reports;
