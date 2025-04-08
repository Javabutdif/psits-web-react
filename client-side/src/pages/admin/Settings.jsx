import { useState } from "react";

const Settings = () => {
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", access: "basic" },
    { id: 2, name: "Jane Smith", access: "admin" },
    { id: 3, name: "Bob Johnson", access: "basic" },
    { id: 4, name: "Alice Williams", access: "moderator" },
  ]);

  const accessLevels = ["basic", "moderator", "admin", "superadmin"];
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkAccessLevel, setBulkAccessLevel] = useState("basic");

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

  const handleIndividualAccessChange = (userId, newAccess) => {
    const updatedUsers = users.map((user) =>
      user.id === userId ? { ...user, access: newAccess } : user
    );
    setUsers(updatedUsers);
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
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border rounded-md">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">Select</th>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Current Access</th>
                  <th className="p-3">Change Access</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) =>
                          handleUserSelect(user.id, e.target.checked)
                        }
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="p-3">{user.name}</td>
                    <td className="p-3 capitalize">{user.access}</td>
                    <td className="p-3">
                      <select
                        value={user.access}
                        onChange={(e) =>
                          handleIndividualAccessChange(user.id, e.target.value)
                        }
                        className="px-2 py-1 border rounded-md text-sm"
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
