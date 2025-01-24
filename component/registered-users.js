import React, { useEffect, useState } from "react";

const RegisteredUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Initial loading state

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users/getAll");
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        } else {
          alert("Failed to fetch users.");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false); // Set loading to false regardless of success or failure
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
          <button className="m-button-5" onClick={() => window.history.back()}>
            Back
          </button>

          {users.length === 0 ? (
            <p>No users registered yet.</p>
          ) : (
            <table className="table-class">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile No</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Game Interest</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={index}>
                    <td>
                      {user.Category === "guest" ? user.Name : user[" Name"] || "N/A"}
                    </td>
                    <td>{user["Mobile no"]}</td>
                    <td>{user.Category}</td>
                    <td>{user.locationType}</td>
                    <td>{user.gameInterest ? user.gameInterest.join(", ") : "N/A"}</td>
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
