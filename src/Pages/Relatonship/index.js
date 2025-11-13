import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Relationship = () => {
  const [streaksData, setStreaksData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // ✅ Fetch data from API
  useEffect(() => {
    axios
      .get("https://site2demo.in/marriageapp/api/relationship-progres-list")
      .then((response) => {
        const data = response.data.data.map((item) => ({
          ...item,
          created_at: new Date(item.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        }));
        setStreaksData(data);
        setFilteredData(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch streak data. Please try again later.");
        setLoading(false);
      });
  }, []);

  // ✅ Search functionality
  useEffect(() => {
    const lowerSearch = searchText.toLowerCase();
    const filtered = streaksData.filter(
      (item) =>
        item.user_name.toLowerCase().includes(lowerSearch) ||
        item.user_email.toLowerCase().includes(lowerSearch)
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchText, streaksData]);

  // ✅ Pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  if (loading)
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="alert alert-danger text-center my-5">{error}</div>
    );

  return (
    <div className="container my-5">
      {/* Header + Search */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <h3 className="mb-3 mb-md-0">Relationship Progress</h3>
        <div className="d-flex align-items-center">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="form-control form-control-sm"
            style={{ width: "250px" }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-striped table-bordered table-hover align-middle">
          <thead className="table-dark text-center">
            <tr>
              <th>User Name</th>
              <th>Email</th>
              <th>Streak Days</th>
              <th>Points</th>
              <th>Tier</th>
              <th>Progress (%)</th>
              <th>Description</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((item, index) => (
                <tr key={index}>
                  <td>{item.user_name}</td>
                  <td>{item.user_email}</td>
                  <td className="text-center">{item.streak_days}</td>
                  <td className="text-center">{item.points}</td>
                  <td className="text-center">{item.tier}</td>
                  <td className="text-center">{item.progress_percent}</td>
                  <td>{item.description}</td>
                  <td className="text-center">{item.created_at}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-muted">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            <li
              className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li
                key={i}
                className={`page-item ${
                  currentPage === i + 1 ? "active" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default Relationship;
