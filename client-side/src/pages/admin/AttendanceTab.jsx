import React, { useState } from "react";
import { CSVLink } from "react-csv";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import ButtonsComponent from "../../components/Custom/ButtonsComponent";
import TableComponent from "../../components/Custom/TableComponent";

const AttendanceTabs = ({ columns, filteredData, searchQuery, setSearchQuery, userData, logAdminAction, setIsFilterOpen }) => {
  const [activeTab, setActiveTab] = useState(0);

  // List of branches
  const branches = ["UC-Main", "UC-Banilad", "UC-LM", "UC-PT"];

  // Function to render TabPanel content
  const renderTabPanelContent = (branchName) => (
    <div className="overflow-x-auto">
      <TableComponent
        columns={columns}
        data={filteredData}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        customButtons={
          <ButtonsComponent style={{ backgroundColor: "#000000" }}>
            <div className="flex items-center gap-10 mb-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => setIsFilterOpen(true)}
              >
                Filter
              </button>
              <CSVLink
                data={filteredData.length ? filteredData : []}
                filename={`attendance-${branchName}.csv`}
              >
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  onClick={() => {
                    logAdminAction({
                      admin_id: userData.id_number,
                      action: `Exported ${branchName} Report CSV`,
                    });
                  }}
                >
                  Export CSV
                </button>
              </CSVLink>
            </div>
          </ButtonsComponent>
        }
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
