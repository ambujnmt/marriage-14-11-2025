import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const Partner = () => {
  const tableRef = useRef(null);
  const dataTableInstance = useRef(null);
  const [partners, setPartners] = useState([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    user_id: "",
    my_name: "",
    my_partner_name: "",
    mobile: "",
    email: "",
    my_partner_mobile: "",
    my_partner_email: "",
    partner: "",
    password: "",
    password_confirm: "",
    upload_photo: null,
  });

  // ✅ Fetch Partners
  const fetchPartners = useCallback(async () => {
    try {
      const { data } = await axios.get(
        "https://site2demo.in/marriageapp/api/partner-list"
      );

      const apiData = data?.data || data?.partners || [];
      if (!Array.isArray(apiData)) {
        console.error("Unexpected API format:", data);
        toast.error("Unexpected response format from API.");
        return setPartners([]);
      }

      const fullData = apiData.map((p) => ({
        ...p,
        image_full_url: p.image
          ? p.image.startsWith("http")
            ? p.image
            : `https://site2demo.in/marriageapp${p.image}`
          : "https://via.placeholder.com/50",
      }));

      setPartners(fullData);
    } catch (error) {
      console.error("Fetch failed:", error);
      toast.error("Failed to load users.");
      setPartners([]);
    }
  }, []);

  // ✅ Delete Partner (useCallback added)
  const deletePartner = useCallback(
    async (user_id) => {
      const confirmed = await MySwal.fire({
        title: "Are you sure?",
        text: "This user will be permanently deleted!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
      });

      if (!confirmed.isConfirmed) return;

      try {
        await axios.post(
          "https://site2demo.in/marriageapp/api/user-delete",
          { user_id },
          { headers: { Accept: "application/json" } }
        );
        toast.success("User deleted successfully!");
        await fetchPartners();
      } catch (error) {
        console.error("Delete failed:", error);
        toast.error("Failed to delete user.");
      }
    },
    [fetchPartners]
  );

  // ✅ Initial Load
  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  // ✅ DataTable Initialization
  useEffect(() => {
    if (!partners || partners.length === 0) return;

    if ($.fn.DataTable.isDataTable(tableRef.current)) {
      dataTableInstance.current.destroy();
      $(tableRef.current).empty();
    }

    dataTableInstance.current = $(tableRef.current).DataTable({
      data: partners,
      columns: [
        { title: "#", data: null, render: (data, type, row, meta) => meta.row + 1 },
        {
          title: "Image",
          data: "image_full_url",
          render: (url) =>
            `<img src="${url}" width="50" height="50" class="rounded-circle" style="object-fit:cover;" onerror="this.src='https://via.placeholder.com/50'" />`,
        },
        { title: "Name", data: "first_name" },
        { title: "Partner", data: "partner" },
        { title: "Role", data: "role" },
        { title: "Email", data: "email" },
        { title: "Mobile", data: "mobile" },
        {
          title: "Actions",
          data: null,
          render: () =>
            `<button class='btn btn-sm btn-warning edit-btn'>Edit</button>
             <button class='btn btn-sm btn-danger ms-2 delete-btn'>Delete</button>`,
        },
      ],
      responsive: true,
    });

    // Remove previous event handlers
    $(tableRef.current).off("click", ".edit-btn");
    $(tableRef.current).off("click", ".delete-btn");

    // Add handlers
    $(tableRef.current).on("click", ".edit-btn", function () {
      const data = dataTableInstance.current.row($(this).closest("tr")).data();
      openEditModal(data);
    });

    $(tableRef.current).on("click", ".delete-btn", function () {
      const data = dataTableInstance.current.row($(this).closest("tr")).data();
      deletePartner(data.id);
    });
  }, [partners, deletePartner]);

  // ✅ Edit Modal Handlers
  const openEditModal = (partner) => {
    setEditData({
      user_id: partner.id,
      my_name: partner.first_name || "",
      my_partner_name: partner.my_partner_name || "",
      mobile: partner.mobile || "",
      email: partner.email || "",
      my_partner_mobile: partner.my_partner_mobile || "",
      my_partner_email: partner.my_partner_email || "",
      partner: partner.partner || "",
      password: "",
      password_confirm: "",
      upload_photo: null,
    });
    setIsEditOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setEditData((prev) => ({
      ...prev,
      upload_photo: e.target.files[0] || null,
    }));
  };

  const submitUpdate = async (e) => {
    e.preventDefault();
    if (editData.password && editData.password !== editData.password_confirm) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(editData).forEach(([key, value]) => {
        if (value !== null) formData.append(key, value);
      });

      const response = await axios.post(
        "https://site2demo.in/marriageapp/api/profile-update",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );

      if (response.data.status) {
        toast.success("User updated successfully!");
        setIsEditOpen(false);
        await fetchPartners();
      } else {
        toast.error(response.data.message || "Failed to update user.");
      }
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update user.");
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">User List</h4>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table
              ref={tableRef}
              className="table table-striped table-bordered align-middle"
              style={{ width: "100%" }}
            ></table>
          </div>
        </div>
      </div>

      {/* ✅ Edit Modal */}
      {isEditOpen && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Edit User</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setIsEditOpen(false)}
                ></button>
              </div>
              <form onSubmit={submitUpdate}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Your Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="my_name"
                        value={editData.my_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Partner Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="my_partner_name"
                        value={editData.my_partner_name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Mobile</label>
                      <input
                        type="text"
                        className="form-control"
                        name="mobile"
                        value={editData.mobile}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={editData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Partner Mobile</label>
                      <input
                        type="text"
                        className="form-control"
                        name="my_partner_mobile"
                        value={editData.my_partner_mobile}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Partner Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="my_partner_email"
                        value={editData.my_partner_email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Partner Type</label>
                      <select
                        name="partner"
                        className="form-select"
                        value={editData.partner}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select</option>
                        <option value="husband">Husband</option>
                        <option value="wife">Wife</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Upload Photo</label>
                      <input
                        type="file"
                        className="form-control"
                        name="upload_photo"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={editData.password}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Confirm Password</label>
                      <input
                        type="password"
                        className="form-control"
                        name="password_confirm"
                        value={editData.password_confirm}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="submit" className="btn btn-success">
                    Update
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsEditOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Partner;
