import React, { useState } from "react";
import { CSVLink } from "react-csv";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import ButtonsComponent from "../../../components/Custom/ButtonsComponent";
import SearchComponent from "../../../components/Custom/SearchComponent";
import TableComponent from "../../../components/Custom/TableComponent";
import FormButton from "../../../components/forms/FormButton";




const AttendanceTabs = ({ columns, filteredData, searchQuery, setSearchQuery, setIsFilterOpen, setShowModal }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  // const [searchQuery, setSearchQuery] = useState("");
  // List of branches
  const branches = ["UC-Main", "UC-Banilad", "UC-LM", "UC-PT"];

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };
  
  const renderTabPanelContent = (branchName) => (
    
    <div className="overflow-x-auto">

      <TableComponent
        columns={columns}
        data={filteredData}
        // searchQuery={searchQuery}
        // onSearchQueryChange={setSearchQuery}
        customButtons={
          <div className="flex flex-row justify-between items-center gap-2 container">
            <div>
              <ButtonsComponent>
              <div className="flex flex-row items-center gap-2 ">
                <FormButton
                  type="button"
                  text="Refresh"
                  onClick={() => setIsFilterOpen(true)}
                  icon={<i className="fas fa-refresh"></i>} // Simple icon
                  styles="bg-[#074873] text-white hover:bg-gray-600 active:bg-gray-700 rounded-md px-4 py-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center gap-2"
                  textClass="text-white" // Elegant text color
                  whileHover={{ scale: 1.01, opacity: 0.95 }}
                  whileTap={{ scale: 0.98, opacity: 0.9 }}
                />
                <FormButton
                  type="button"
                  text="Scan QR"
                  // onClick={() => handleViewBtn(row)}
                  icon={<i className="fas fa-qrcode text-base"></i>} // Simple icon
                  styles="bg-blue-100 text-blue-800 hover:bg-blue-200 active:bg-blue-300 rounded-md px-4 py-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center gap-2"
                  textClass="text-gray-800" // Elegant text color
                  whileHover={{ scale: 1.01, opacity: 0.95 }}
                  whileTap={{ scale: 0.98, opacity: 0.9 }}
                />
              </div>
              </ButtonsComponent>
            
            </div>
            <div>
              <ButtonsComponent>
              <div className="flex flex-row justify-right gap-2 ">
                <CSVLink
                  data={filteredData.length ? filteredData : []}
                  filename={`attendance-${branchName}.csv`}
                  >
                  <FormButton
                    type="button"
                    text="Export CSV"
                    onClick={() => logAdminAction({
                      admin_id: userData.id_number,
                      action: `Exported ${branchName} Report CSV`,
                    })}
                    icon={<i className="fas fa-file"></i>} // Simple icon
                    styles="bg-green-500 text-white hover:bg-green-600 active:bg-green-700 rounded-md px-4 py-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center gap-2"
                    textClass="text-white" // Elegant text color
                    whileHover={{ scale: 1.01, opacity: 0.95 }}
                    whileTap={{ scale: 0.98, opacity: 0.9 }}
                  />

                </CSVLink>
              </div>
              </ButtonsComponent>
            
            </div>
          </div>
        }
        customSearch={
          <div className="flex flex-row justify-left items-center gap-2 container">
            <div className="w-full flex-1 p-2">
              <SearchComponent
                searchQuery={searchQuery}
                handleSearchChange={handleSearchChange}
                placeholder="Search data..."
              />
            </div>
            <div>
              <ButtonsComponent>
              <div className="flex flex-row justify-between gap-2 ">
                <FormButton
                  type="button"
                  text="Filter"
                  onClick={() => setIsFilterOpen(true)}
                  icon={<i className="fas fa-filter"></i>} // Simple icon
                  styles="bg-gray-500 text-white hover:bg-gray-600 active:bg-gray-700 rounded-md px-4 py-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center gap-2"
                  textClass="text-white" // Elegant text color
                  whileHover={{ scale: 1.01, opacity: 0.95 }}
                  whileTap={{ scale: 0.98, opacity: 0.9 }}
                />
                <FormButton
                  type="button"
                  text="Sort"
                  // onClick={() => handleViewBtn(row)}
                  icon={<i className="fas fa-sort"></i>} // Simple icon
                  styles="bg-blue-100 text-blue-800 hover:bg-blue-200 active:bg-blue-300 rounded-md px-4 py-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center gap-2"
                  textClass="text-gray-800" // Elegant text color
                  whileHover={{ scale: 1.01, opacity: 0.95 }}
                  whileTap={{ scale: 0.98, opacity: 0.9 }}
                />
              </div>


              </ButtonsComponent>
            
            </div>
          </div>
        }
        // customButtons={
        
        // <div className="flex flex-column justify-between gap-4 mb-4">
        //   <div>
        //     <FormButton
        //       type="button"
        //       text="Filter"
        //       onClick={() => setIsFilterOpen(true)}
        //       icon={<i className="fas fa-filter"></i>} // Simple icon
        //       styles="bg-gray-500 text-white hover:bg-gray-600 active:bg-gray-700 rounded-md px-4 py-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center gap-2"
        //       textClass="text-white" // Elegant text color
        //       whileHover={{ scale: 1.01, opacity: 0.95 }}
        //       whileTap={{ scale: 0.98, opacity: 0.9 }}
        //     />
        //     <FormButton
        //       type="button"
        //       text="Scan QR"
        //       // onClick={() => handleViewBtn(row)}
        //       icon={<i className="fas fa-qrcode text-base"></i>} // Simple icon
        //       styles="bg-blue-100 text-blue-800 hover:bg-blue-200 active:bg-blue-300 rounded-md p-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center gap-2"
        //       textClass="text-gray-800" // Elegant text color
        //       whileHover={{ scale: 1.01, opacity: 0.95 }}
        //       whileTap={{ scale: 0.98, opacity: 0.9 }}
        //     />

        //   </div>
        //   <div>
        //     <FormButton
        //       type="button"
        //       text="Filter"
        //       onClick={() => setIsFilterOpen(true)}
        //       icon={<i className="fas fa-filter"></i>} // Simple icon
        //       styles="bg-gray-500 text-white hover:bg-gray-600 active:bg-gray-700 rounded-md px-4 py-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center gap-2"
        //       textClass="text-white" // Elegant text color
        //       whileHover={{ scale: 1.01, opacity: 0.95 }}
        //       whileTap={{ scale: 0.98, opacity: 0.9 }}
        //     />

        //     <CSVLink
        //       data={filteredData.length ? filteredData : []}
        //       filename={`attendance-${branchName}.csv`}
        //     >
        //       <FormButton
        //         type="button"
        //         text="Export CSV"
        //         onClick={() => logAdminAction({
        //           admin_id: userData.id_number,
        //           action: `Exported ${branchName} Report CSV`,
        //         })}
        //         icon={<i className="fas fa-file"></i>} // Simple icon
        //         styles="bg-green-500 text-white hover:bg-green-600 active:bg-green-700 rounded-md px-4 py-2 text-sm transition duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center gap-2"
        //         textClass="text-white" // Elegant text color
        //         whileHover={{ scale: 1.01, opacity: 0.95 }}
        //         whileTap={{ scale: 0.98, opacity: 0.9 }}
        //       />

        //     </CSVLink>
        //   </div>


        // </div>
        // }
      />
    </div>
  );

  return (
    <Tabs selectedIndex={activeTab} onSelect={(index) => setActiveTab(index)}>
      <TabList>
        {branches.map((branch) => (
          <Tab key={branch}>{branch}</Tab>
        ))}
      </TabList>
      {branches.map((branch) => (
        <TabPanel key={branch}>
          {renderTabPanelContent(branch)}
        </TabPanel>
      ))}
    </Tabs>
  );
};

export default AttendanceTabs;
