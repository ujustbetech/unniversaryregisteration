import React, { useEffect, useState } from "react";
import ExportFeedback from "./ExportFeedback";
import ExportButton from "./ExportFeedback";

const RegisteredUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users/getAll");
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users.reverse()); // Reverse to show newest first
        } else {
          alert("Failed to fetch users.");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <>
      {loading && (
        <div className="loader">
          <span className="loader2"></span>
        </div>
      )}
      {!loading && (
        <section className="c-userslist box">
        

          <h2>Registered Users</h2>
          <ExportButton/>
          {users.length === 0 ? (
            <p>No users registered yet.</p>
          ) : (
            <table className="table-class">
              <thead>
                <tr>
                  <th>Sr No</th>
                  <th>Name</th>
                  <th>Mobile No</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Game Interest</th>
                  <th>Achievements</th>
                  <th>Skills</th>
                  <th>Special Moment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{user.Category === "Guest" ? user.Name : user[" Name"] || "N/A"}</td>
                    <td>{user["Mobile no"]}</td>
                    <td>{user.Category}</td>
                    <td>{user.locationType}</td>
                    <td>{user.gameInterest ? user.gameInterest.join(", ") : "N/A"}</td>
                    <td>{user.achievements ? user.achievements : "N/A"}</td>
                    <td>{user.skills ? user.skills : "N/A"}</td>
                    <td>{user.specialMoment ? user.specialMoment : "N/A"}</td>
                    <td>
                      {user.attendance ? (
                        <span className="text-green-600 font-bold">Present</span>
                      ) : (
                        <span className="text-red-600 font-bold">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </>
  );
};

export default RegisteredUsers;
