import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css"; 

const Weaklyrating = () => {
  const apiUrl = "https://site2demo.in/marriageapp/api/weakly-all-rating-list";
  const deleteUrl = "https://site2demo.in/marriageapp/api/weakly-rating-delete";

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      if (result.status) {
        setData(result.data);
        setFilteredData(result.data);
      } else {
        console.error("API Error:", result.message);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this rating?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const formData = new FormData();
        formData.append("id", id);

        const response = await fetch(deleteUrl, {
          method: "POST",
          body: formData,
        });

        const deleteResult = await response.json();

        if (deleteResult.status) {
          Swal.fire("Deleted!", "Rating deleted successfully.", "success");
          fetchData();
        } else {
          Swal.fire("Failed!", "Failed to delete rating.", "error");
        }
      } catch (error) {
        console.error("Delete Error:", error);
        Swal.fire("Error!", "An error occurred while deleting.", "error");
      }
    }
  };

  const handleEdit = (id) => {
    Swal.fire("Info", `Edit function called for rating ID: ${id}`, "info");
  };

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearch(keyword);
    setPage(1);
    if (!keyword) return setFilteredData(data);

    const filtered = data.filter(
      (item) =>
        item.user_name.toLowerCase().includes(keyword) ||
        item.feedback.toLowerCase().includes(keyword)
    );
    setFilteredData(filtered);
  };

  const totalPages = Math.ceil(filteredData.length / perPage);
  const startIndex = (page - 1) * perPage;
  const currentPageData = filteredData.slice(startIndex, startIndex + perPage);

  return (
    <div className="container my-4">
      <h1 className="mb-4">Weekly Rating List</h1>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by user name or feedback"
          value={search}
          onChange={handleSearch}
        />
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : currentPageData.length === 0 ? (
        <p className="text-center">No ratings found.</p>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>User Name</th>
                  <th>Rating</th>
                  <th>Feedback</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPageData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.user_name}</td>
                    <td>{item.rating}</td>
                    <td>{item.feedback}</td>
                    <td>{formatDate(item.created_at)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-info me-2"
                        onClick={() => handleEdit(item.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ Bootstrap Pagination */}
          <nav className="d-flex justify-content-center mt-3">
            <ul className="pagination">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </button>
              </li>

              {[...Array(totalPages || 1)].map((_, index) => (
                <li
                  key={index}
                  className={`page-item ${page === index + 1 ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}

              <li
                className={`page-item ${
                  page === totalPages || totalPages === 0 ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
};

export default Weaklyrating;
