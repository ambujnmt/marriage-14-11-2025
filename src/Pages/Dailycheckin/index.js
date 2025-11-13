import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "https://site2demo.in/marriageapp/api";

const DailyCheckin = () => {
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newStatus, setNewStatus] = useState("active");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const USER_ID = localStorage.getItem("user_id");
  const isAdmin = true;

  useEffect(() => {
    fetchQuestions();
  }, [searchQuery, itemsPerPage]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`${API_BASE}/questions`);
      const data = await res.json();
      if (data.status && Array.isArray(data.data)) {
        const formatted = data.data.map((q) => ({
          id: q.id,
          text: q.question,
          status: q.status.charAt(0).toUpperCase() + q.status.slice(1),
        }));
        setQuestions(formatted);
      } else {
        toast.error("Failed to load questions");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading questions");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) {
      toast.error("Question cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("question", newQuestion);
      formData.append("status", newStatus.toLowerCase());
      formData.append("user_id", USER_ID);

      let url = `${API_BASE}/question-create`;
      if (editingQuestion) {
        url = `${API_BASE}/question-update`;
        formData.append("id", editingQuestion.id);
      }

      const res = await fetch(url, { method: "POST", body: formData });
      const data = await res.json();
      if (data.status) {
        toast.success(data.message || "Saved successfully");
        fetchQuestions();
        resetForm();
      } else {
        toast.error(data.message || "Failed to save");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving question");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this question?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("user_id", USER_ID);

      const res = await fetch(`${API_BASE}/question-delete`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.status) {
        toast.success("Question deleted");
        fetchQuestions();
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting question");
    }
  };

  const resetForm = () => {
    setEditingQuestion(null);
    setNewQuestion("");
    setNewStatus("active");
    setShowForm(false);
  };

  const filtered = questions.filter((q) =>
    q.text.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="container-fluid py-4">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Daily Check-in Questions</h5>
          {isAdmin && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              ➕ Add Question
            </button>
          )}
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-6 col-sm-12 mb-2">
              <div className="d-flex align-items-center">
                <label className="me-2">Show:</label>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "90px" }}
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-6 col-sm-12 text-end">
              <input
                type="text"
                className="form-control form-control-sm d-inline-block"
                style={{ maxWidth: "250px" }}
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-striped align-middle">
              <thead className="table-dark text-center">
                <tr>
                  <th style={{ width: "60px" }}>#</th>
                  <th>Question</th>
                  <th style={{ width: "120px" }}>Status</th>
                  {isAdmin && <th style={{ width: "160px" }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {paginated.length ? (
                  paginated.map((q, index) => (
                    <tr key={q.id}>
                      <td className="text-center">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td>{q.text}</td>
                      <td className="text-center">
                        <span
                          className={`badge ${
                            q.status === "Active"
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => {
                              setEditingQuestion(q);
                              setNewQuestion(q.text);
                              setNewStatus(q.status.toLowerCase());
                              setShowForm(true);
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(q.id)}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={isAdmin ? 4 : 3}
                      className="text-center text-muted py-3"
                    >
                      No questions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav>
              <ul className="pagination justify-content-center mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
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
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                  >
                    »
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>

      {/* Bootstrap Modal */}
      <div
        className={`modal fade ${showForm ? "show d-block" : ""}`}
        tabIndex="-1"
        style={{
          backgroundColor: showForm ? "rgba(0,0,0,0.5)" : "transparent",
        }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editingQuestion ? "Edit Question" : "Add Question"}
              </h5>
              <button type="button" className="btn-close" onClick={resetForm}></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Question</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default DailyCheckin;
