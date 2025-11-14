import React, { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { createPortal } from "react-dom";

const API_BASE = "https://site2demo.in/marriageapp/api";

const Answer = () => {
  const [answers, setAnswers] = useState([]);
  const [filteredAnswers, setFilteredAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editAnswer, setEditAnswer] = useState(null);
  const [newAnswerText, setNewAnswerText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("view");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch all answers initially (wrapped in useCallback)
  const fetchAnswers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/answer-list`);
      const data = await response.json();
      if (data.status && Array.isArray(data.data)) {
        setAnswers(data.data);
        setFilteredAnswers(data.data);
      } else {
        toast.error("Failed to load answers.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching answers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnswers();
  }, [fetchAnswers]);

  // Handle search query and filter answers
  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = answers.filter(
      (a) =>
        a.answer?.toLowerCase().includes(query.toLowerCase()) ||
        a.question?.question?.toLowerCase().includes(query.toLowerCase()) ||
        a.user?.first_name?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredAnswers(filtered);
    setCurrentPage(1); // Reset to the first page when searching
  };

  // Handle delete answer
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          const response = await fetch(`${API_BASE}/answer-delete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          const data = await response.json();
          if (data.status) {
            toast.success(data.message || "Deleted successfully");
            setAnswers((prev) => prev.filter((a) => a.id !== id));
          } else {
            toast.error(data.message || "Delete failed");
          }
        } catch (error) {
          console.error(error);
          toast.error("Error deleting answer");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Handle Edit & View answer
  const handleEdit = (answer) => {
    setEditAnswer(answer);
    setNewAnswerText(answer.answer);
    setModalType("edit");
    setShowModal(true);
  };

  const handleView = (answer) => {
    setEditAnswer(answer);
    setModalType("view");
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!newAnswerText.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/answer-update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editAnswer.id,
          answer: newAnswerText,
          question_id: editAnswer.question_id,
          user_id: editAnswer.user_id,
        }),
      });
      const data = await response.json();
      if (data.status) {
        toast.success(data.message || "Answer updated");
        setAnswers((prev) =>
          prev.map((a) =>
            a.id === editAnswer.id ? { ...a, answer: newAnswerText } : a
          )
        );
        closeModal();
      } else toast.error(data.message || "Update failed");
    } catch (error) {
      console.error(error);
      toast.error("Error updating answer");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditAnswer(null);
    setNewAnswerText("");
  };

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const currentAnswers = filteredAnswers.slice(
    indexOfLast - itemsPerPage,
    indexOfLast
  );
  const totalPages = Math.ceil(filteredAnswers.length / itemsPerPage);

  return (
    <div className="container py-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Answer List</h4>
          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select form-select-sm"
              style={{ width: "80px" }}
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
            <input
              type="text"
              placeholder="Search..."
              className="form-control form-control-sm"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="card-body table-responsive">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <table className="table table-striped table-bordered align-middle text-center">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Question</th>
                  <th>User Name</th>
                  <th>Answer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentAnswers.length ? (
                  currentAnswers.map((a) => (
                    <tr key={a.id}>
                      <td>{a.id}</td>
                      <td>{a.question?.question}</td>
                      <td>{a.user?.first_name}</td>
                      <td className="text-start">
                        {a.answer.length > 50 ? (
                          <>
                            {a.answer.slice(0, 50)}...
                            <button
                              className="btn btn-link btn-sm p-0"
                              onClick={() => handleView(a)}
                            >
                              View
                            </button>
                          </>
                        ) : (
                          a.answer
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(a)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(a.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No answers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center mt-3 flex-wrap gap-1">
              <button
                className="btn btn-sm btn-outline-primary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`btn btn-sm ${
                    currentPage === i + 1
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="btn btn-sm btn-outline-primary"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bootstrap Modal (View/Edit) */}
      {showModal &&
        createPortal(
          <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    {modalType === "view" ? "View Answer" : "Edit Answer"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={closeModal}
                  ></button>
                </div>
                <div className="modal-body">
                  {modalType === "view" ? (
                    <>
                      <p>
                        <strong>Question:</strong>{" "}
                        {editAnswer?.question?.question}
                      </p>
                      <p>
                        <strong>User:</strong> {editAnswer?.user?.first_name}
                      </p>
                      <div className="border p-3 bg-light rounded">
                        {editAnswer?.answer}
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleUpdate}>
                      <div className="mb-3">
                        <label className="form-label">Answer</label>
                        <textarea
                          className="form-control"
                          rows="5"
                          value={newAnswerText}
                          onChange={(e) => setNewAnswerText(e.target.value)}
                          required
                        ></textarea>
                      </div>
                      <div className="text-end">
                        <button
                          type="submit"
                          className="btn btn-success me-2"
                          disabled={loading}
                        >
                          {loading ? "Updating..." : "Update"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={closeModal}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Answer;
