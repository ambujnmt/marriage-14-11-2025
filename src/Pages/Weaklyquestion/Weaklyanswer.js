import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const WeaklyAnswer = () => {
  const API_URL = "https://site2demo.in/marriageapp/api";

  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ✅ Fetch all answers
  const fetchAnswers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/weakly-answer-list`);
      const data = await res.json();
      if (data.status) {
        setAnswers(data.data);
      } else {
        setAnswers([]);
      }
    } catch (error) {
      console.error("Error fetching answers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnswers();
  }, []);

  // ✅ Delete answer
  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this answer!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${API_URL}/weakly-answer-delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status) {
              Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: data.message || "Answer deleted successfully.",
                timer: 1500,
                showConfirmButton: false,
              });
              fetchAnswers();
            } else {
              Swal.fire({
                icon: "error",
                title: "Failed!",
                text: data.message || "Something went wrong.",
              });
            }
          })
          .catch((error) => {
            console.error("Error deleting answer:", error);
            Swal.fire({
              icon: "error",
              title: "Error!",
              text: "Failed to delete the answer.",
            });
          });
      }
    });
  };

  // ✅ Format date properly (Example: 13 Nov 2025, 10:45 AM)
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ✅ Filter + Pagination
  const filteredAnswers = answers.filter(
    (item) =>
      item.question?.question
        ?.toLowerCase()
        .includes(filterText.toLowerCase()) ||
      item.answer
        ?.toLowerCase()
        .includes(filterText.toLowerCase()) ||
      item.user?.first_name
        ?.toLowerCase()
        .includes(filterText.toLowerCase()) ||
      item.user?.email
        ?.toLowerCase()
        .includes(filterText.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAnswers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAnswers = filteredAnswers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Weekly Answers</h3>
      </div>

      {/* Search + Per Page */}
      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">Search:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search by question, user, or answer..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <div className="col-md-3 ms-auto">
          <label className="form-label">Show per page:</label>
          <select
            className="form-select"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-striped table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Question</th>
              <th scope="col">Answer</th>
              <th scope="col">User</th>
              <th scope="col">Email</th>
              <th scope="col">Date</th>
              <th scope="col" style={{ width: "100px" }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center">
                  <div
                    className="spinner-border text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">
                      Loading...
                    </span>
                  </div>
                </td>
              </tr>
            ) : currentAnswers.length > 0 ? (
              currentAnswers.map((item, index) => (
                <tr key={item.id}>
                  <td>{startIndex + index + 1}</td>
                  <td>{item.question?.question || "N/A"}</td>
                  <td>{item.answer}</td>
                  <td>{item.user?.first_name || "N/A"}</td>
                  <td>{item.user?.email || "N/A"}</td>
                  <td>{formatDate(item.created_at)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-muted">
                  No answers found.
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
              className={`page-item ${
                currentPage === 1 ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() =>
                  setCurrentPage((prev) => Math.max(prev - 1, 1))
                }
              >
                «
              </button>
            </li>

            {[...Array(totalPages)].map((_, i) => (
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
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, totalPages)
                  )
                }
              >
                »
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default WeaklyAnswer;
