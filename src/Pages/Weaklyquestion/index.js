import React, { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal } from "bootstrap";

const API_BASE = "https://site2demo.in/marriageapp/api";

const Weaklyquestion = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newStatus, setNewStatus] = useState("active");
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const USER_ID = localStorage.getItem("user_id") || "1";
  const isAdmin = true;

  // ✅ Wrapped fetchQuestions in useCallback (fixes ESLint warning)
  const fetchQuestions = useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append("user_id", USER_ID);

      const resp = await fetch(`${API_BASE}/weakly-questions-list`, {
        method: "POST",
        body: formData,
      });
      const data = await resp.json();

      if (data.status && Array.isArray(data.data)) {
        setQuestions(
          data.data.map((q) => ({
            id: q.id,
            text: q.question,
            status: q.status.charAt(0).toUpperCase() + q.status.slice(1),
          }))
        );
      } else {
        toast.error(data.message || "Failed to load questions");
        setQuestions([]);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Something went wrong while loading questions");
    }
  }, [USER_ID]); // dependency fixed ✅

  // ✅ Call once on mount
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]); // dependency fixed ✅

  const openModal = () => {
    const modalEl = document.getElementById("questionModal");
    const modal = new Modal(modalEl);
    modal.show();
  };

  const closeModal = () => {
    const modalEl = document.getElementById("questionModal");
    const modal = Modal.getInstance(modalEl);
    if (modal) modal.hide();
  };

  const handleAddNew = () => {
    setNewQuestion("");
    setNewStatus("active");
    setEditingQuestion(null);
    openModal();
  };

  const handleEdit = (q) => {
    setNewQuestion(q.text);
    setNewStatus(q.status.toLowerCase());
    setEditingQuestion(q);
    openModal();
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) {
      toast.warn("Question cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("question", newQuestion.trim());
      formData.append("status", newStatus.toLowerCase());
      formData.append("user_id", USER_ID);

      let url = `${API_BASE}/weakly-question`;
      if (editingQuestion) {
        url = `${API_BASE}/weakly-question-update`;
        formData.append("id", editingQuestion.id);
      }

      const resp = await fetch(url, { method: "POST", body: formData });
      const data = await resp.json();

      if (data.status) {
        toast.success(
          data.message ||
            (editingQuestion ? "Updated successfully" : "Created successfully")
        );
        await fetchQuestions();
        closeModal();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error("Something went wrong while saving");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Confirm deletion",
      text: "Do you want to delete this question?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("user_id", USER_ID);

      const resp = await fetch(`${API_BASE}/weakly-question-delete`, {
        method: "POST",
        body: formData,
      });
      const data = await resp.json();

      if (data.status) {
        toast.success(data.message || "Deleted successfully");
        await fetchQuestions();
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Something went wrong while deleting");
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter((q) =>
    q.text.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Weekly Question List</h3>
        {isAdmin && (
          <button className="btn btn-primary" onClick={handleAddNew}>
            ➕ Add Question
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="row mb-3">
        <div className="col-md-3">
          <label className="form-label">Show per page:</label>
          <select
            className="form-select"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(parseInt(e.target.value, 10));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="col-md-4 ms-auto">
          <label className="form-label">Search:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Question</th>
              <th>Status</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedQuestions.length > 0 ? (
              paginatedQuestions.map((q) => (
                <tr key={q.id}>
                  <td>{q.id}</td>
                  <td>{q.text}</td>
                  <td>
                    <span
                      className={`badge ${
                        q.status === "Active" ? "bg-success" : "bg-secondary"
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(q)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(q.id)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin ? 4 : 3} className="text-center text-muted">
                  No questions found
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
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                «
              </button>
            </li>
            {[...Array(totalPages)].map((_, i) => (
              <li
                key={i}
                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
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
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
              >
                »
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/* Modal */}
      <div
        className="modal fade"
        id="questionModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={handleSaveQuestion}>
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingQuestion ? "Edit Question" : "Add New Question"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
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
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Weaklyquestion;
