import { useState, useEffect } from "react";
import { getAllOfficers, editAdminAccess } from "../../api/admin";
import { getInformationData } from "../../authentication/Authentication";

const Settings = () => {
  const accessLevels = ["none", "standard", "finance", "executive", "admin"];
  const enums = {
    none: "None UC-Main Campus",
    standard: "Basic/Standard Access",
    finance: "Finance Access",
    executive: "Executive Access",
    admin: "Admin Access",
  };

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkAccessLevel, setBulkAccessLevel] = useState(accessLevels[0]);
  const [users, setUsers] = useState([]);
  const data = getInformationData();

  const fetchUsers = async () => {
    try {
      const response = await getAllOfficers();

      setUsers(response ? response : []);
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserSelect = (userId, isSelected) => {
    if (isSelected) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    }
  };

  const handleBulkAccessChange = () => {
    if (selectedUsers.length === 0) return;

    const updatedUsers = users.map((user) =>
      selectedUsers.includes(user.id)
        ? { ...user, access: bulkAccessLevel }
        : user
    );

    setUsers(updatedUsers);
    setSelectedUsers([]);
  };

  const handleIndividualAccessChange = async (id_number, newAccess) => {
    const updatedUsers = users.map((user) =>
      user.id_number === id_number ? { ...user, access: newAccess } : user
    );

    try {
      const response = await editAdminAccess(id_number, newAccess);
      if (response) {
        setUsers(updatedUsers);
        fetchUsers();
        if (id_number === data.id_number) {
          window.location.reload();
        }
      } else {
        console.error("Error updating access:", response);
      }
    } catch (error) {
      console.error("Error updating access:", error);
    }
  };

  const handleRenewMembership = () => {
    alert("Membership renewal process initiated. Redirecting to payment...");
  };

  return (
    <div className="max-w-full mx-auto p-6 space-y-10 text-gray-800">
      {/* User Access Section */}
      <section className="bg-white rounded-2xl shadow p-6 space-y-6">
        <h2 className="text-xl font-medium border-b pb-2">
          User Access Management
        </h2>

        {/* Bulk Access Control */}
        <div>
          <h3 className="text-lg font-medium mb-2">Bulk Access Update</h3>
          <div className="flex items-center gap-4">
            <select
              value={bulkAccessLevel}
              onChange={(e) => setBulkAccessLevel(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              {accessLevels.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
            <button
              onClick={handleBulkAccessChange}
              disabled={selectedUsers.length === 0}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                selectedUsers.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              Update Selected Users
            </button>
          </div>
        </div>

        {/* User List */}
        <div>
          <h3 className="text-lg font-medium mb-2">All Users</h3>
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full text-sm border rounded-md">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">Select</th>
                  <th className="p-3">Officer Name</th>
                  <th className="p-3">Campus</th>
                  <th className="p-3">Position</th>
                  <th className="p-3">Current Access</th>
                  <th className="p-3">Change Access</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id_number} className="border-t">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id_number)}
                        onChange={(e) =>
                          handleUserSelect(user.id, e.target.checked)
                        }
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.campus}</td>
                    <td className="p-3">{user.position}</td>
                    <td className="p-3 capitalize">{enums[user.access]}</td>
                    <td className="p-3">
                      <select
                        value={user.access}
                        onChange={(e) =>
                          handleIndividualAccessChange(
                            user.id_number,
                            e.target.value
                          )
                        }
                        disabled={data.access === "standard"}
                        className={`px-2 py-1 border rounded-md text-sm ${
                          data.access === "standard"
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {accessLevels.map((level) => (
                          <option key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Membership Renewal Section */}
      <section className="bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-xl font-medium border-b pb-2">Membership</h2>
        <div className="space-y-2">
          <p>Renew all active membership.</p>
          <button
            onClick={handleRenewMembership}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium"
          >
            Renew Membership
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
