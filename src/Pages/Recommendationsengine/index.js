import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css"; 

const API_BASE = "https://site2demo.in/marriageapp/api";
const loggedInUserId = localStorage.getItem("user_id");

const RecommendationsEngine = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 5;

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [form, setForm] = useState({
    id: null,
    title: "",
    subtitle: "",
    description: "",
    image: null,
    button_label: "",
    button_link: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  // 🧠 Fetch Recommendations
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/recomendation-all?user_id=${loggedInUserId}`);
      const result = await res.json();

      if (result.recommendations && Array.isArray(result.recommendations)) {
        setData(result.recommendations);
      } else {
        setData([]);
        setError("No recommendations found for this user.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message || "Failed to fetch recommendations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🗓 Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // 🔍 Search and Pagination logic
  const filteredData = data.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.subtitle &&
        item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setForm((prev) => ({ ...prev, image: files[0] }));
    else setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🧩 Modal open functions
  const openCreateModal = () => {
    setForm({
      id: null,
      title: "",
      subtitle: "",
      description: "",
      image: null,
      button_label: "",
      button_link: "",
    });
    setModalMode("create");
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setForm({
      id: item.id,
      title: item.title || "",
      subtitle: item.subtitle || "",
      description: item.description || "",
      image: null,
      button_label: item.button_label || "",
      button_link: item.button_link || "",
    });
    setModalMode("edit");
    setShowModal(true);
  };

  // 🧾 CRUD Handlers
  const handleCreate = async () => {
    setActionLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key]) formData.append(key, form[key]);
      });
      formData.append("user_id", loggedInUserId);

      const res = await fetch(`${API_BASE}/recomendation-create`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.status)
        throw new Error(data.message || "Failed to create recommendation");

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Recommendation created successfully!",
        timer: 2000,
        showConfirmButton: false,
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    setActionLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key]) formData.append(key, form[key]);
      });
      formData.append("user_id", loggedInUserId);

      const res = await fetch(`${API_BASE}/recomendation-update`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.status)
        throw new Error(data.message || "Failed to update recommendation");

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Recommendation updated successfully!",
        timer: 2000,
        showConfirmButton: false,
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this recommendation?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const formData = new FormData();
          formData.append("user_id", loggedInUserId);
          formData.append("id", id);

          const res = await fetch(`${API_BASE}/recomendation-delete`, {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (!res.ok || !data.status)
            throw new Error(data.message || "Failed to delete recommendation");

          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Recommendation deleted successfully!",
            confirmButtonText: "Okay",
          });

          fetchData();
        } catch (err) {
          Swal.fire({ icon: "error", title: "Error", text: err.message });
        }
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    modalMode === "create" ? handleCreate() : handleUpdate();
  };

  // ⏳ Loading or Error State
  if (loading) return <div className="text-center mt-4">Loading...</div>;
  if (error) return <div className="text-danger text-center mt-4">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search by title, description, subtitle..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <button onClick={openCreateModal} className="btn btn-primary">
          + Create Recommendation
        </button>
      </div>

      {/* 📋 Data Table */}
      <table className="table table-hover table-bordered">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Subtitle</th>
            <th>Date Added</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.length ? (
            paginatedData.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.title}</td>
                <td>{item.description}</td>
                <td>{item.subtitle || "-"}</td>
                <td>{formatDate(item.created_at)}</td>
                <td>
                  <button
                    className="btn btn-info btn-sm me-2"
                    onClick={() => openEditModal(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No recommendations found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ Bootstrap Pagination (Always visible) */}
      <nav className="d-flex justify-content-center mt-3">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={prevPage}>
              Previous
            </button>
          </li>

          {[...Array(totalPages || 1)].map((_, index) => (
            <li
              key={index}
              className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            </li>
          ))}

          <li
            className={`page-item ${
              currentPage === totalPages || totalPages === 0 ? "disabled" : ""
            }`}
          >
            <button className="page-link" onClick={nextPage}>
              Next
            </button>
          </li>
        </ul>
      </nav>

      {/* 🧩 Modal */}
      <div className={`modal ${showModal ? "d-block" : ""}`} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {modalMode === "create" ? "Create Recommendation" : "Edit Recommendation"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowModal(false)}
              ></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Subtitle</label>
                  <input
                    type="text"
                    name="subtitle"
                    className="form-control"
                    value={form.subtitle}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="form-control"
                    value={form.description}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Image</label>
                  <input
                    type="file"
                    name="image"
                    className="form-control"
                    onChange={handleChange}
                  />
                  {form.image && (
                    <img
                      src={URL.createObjectURL(form.image)}
                      alt="Preview"
                      className="img-thumbnail mt-2"
                      style={{ width: 100, height: 100, objectFit: "cover" }}
                    />
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Button Label</label>
                  <input
                    type="text"
                    name="button_label"
                    className="form-control"
                    value={form.button_label}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? modalMode === "create"
                      ? "Creating..."
                      : "Updating..."
                    : modalMode === "create"
                    ? "Create"
                    : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {showModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default RecommendationsEngine;
