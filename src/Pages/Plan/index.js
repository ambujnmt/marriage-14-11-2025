import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

const Plan = () => {
  const BASE_URL = "https://site2demo.in/marriageapp/api";
  const LIST_URL = `${BASE_URL}/plans-list`;
  const CREATE_URL = `${BASE_URL}/plans-create`;
  const UPDATE_URL = `${BASE_URL}/plans-update`;
  const DELETE_URL = `${BASE_URL}/plans-delete`;

  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalType, setModalType] = useState("create");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    duration_days: "",
    price: "",
  });

  // Fetch all plans
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await axios.get(LIST_URL);
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || res.data?.results || [];
      setPlans(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load plans");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit create or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const url = modalType === "create" ? CREATE_URL : UPDATE_URL;
      const payload =
        modalType === "create"
          ? formData
          : { plan_id: selectedPlan?.id, ...formData };

      const res = await axios.post(url, payload);

      if (!res.data?.status) {
        toast.error(res.data?.message || "Failed to save plan");
        return;
      }

      toast.success(
        modalType === "create"
          ? "Plan created successfully!"
          : "Plan updated successfully!"
      );

      setShowModal(false);
      setFormData({ name: "", duration_days: "", price: "" });
      fetchPlans();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // Delete plan
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this plan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.post(DELETE_URL, { plan_id: id });
          if (!res.data?.status) {
            toast.error(res.data?.message || "Failed to delete plan");
            return;
          }
          toast.success("Plan deleted successfully!");
          fetchPlans();
        } catch (err) {
          console.error(err);
          Swal.fire("Error!", "Failed to delete plan.", "error");
        }
      }
    });
  };

  // Filter and paginate plans
  const filteredPlans = plans.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
  const paginatedPlans = filteredPlans.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Open modal
  const openModal = (type, plan = null) => {
    setModalType(type);
    setSelectedPlan(plan);

    if (type === "edit" && plan) {
      setFormData({
        name: plan.name || "",
        duration_days: plan.duration_days || "",
        price: plan.price || "",
      });
    } else {
      setFormData({ name: "", duration_days: "", price: "" });
    }

    setShowModal(true);
  };

  return (
    <div className="container mt-4">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <h3 className="mb-0">Plans List</h3>
        <button className="btn btn-primary" onClick={() => openModal("create")}>
          + Add Plan
        </button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Search plan..."
          className="form-control form-control-sm"
          style={{ width: "250px" }}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: "60px" }}>#</th>
                <th>Name</th>
                <th>Duration (Days)</th>
                <th>Price</th>
                <th style={{ width: "180px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPlans.length > 0 ? (
                paginatedPlans.map((plan, idx) => (
                  <tr key={plan.id}>
                    <td>{(page - 1) * itemsPerPage + idx + 1}</td>
                    <td>{plan.name}</td>
                    <td>{plan.duration_days}</td>
                    <td>{plan.price}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => openModal("edit", plan)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(plan.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-3">
                    No plans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            {[...Array(totalPages)].map((_, i) => (
              <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setPage(i + 1)}
                  style={{ cursor: "pointer" }}
                >
                  {i + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow">
              <form onSubmit={handleSubmit}>
                <div className="modal-header bg-light">
                  <h5 className="modal-title mb-0">
                    {modalType === "create" ? "Add Plan" : "Edit Plan"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter plan name"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Duration (Days)</label>
                    <input
                      type="number"
                      name="duration_days"
                      value={formData.duration_days}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter duration"
                      required
                      min="1"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Price</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter price"
                      required
                      min="0"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-success" disabled={loading}>
                    {modalType === "create" ? "Save" : "Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plan;
