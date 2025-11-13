import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';  // For date formatting

const Subscription = () => {
    const url = "https://site2demo.in/marriageapp/api/purchase-admin-list";

    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchSubscriptions = async () => {
        try {
            const response = await axios.post(url, { user_id: 1 });
            if (response.data.status) setSubscriptions(response.data.data);
        } catch {
            setError("Failed to fetch subscription data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const filteredSubscriptions = subscriptions.filter(subscription =>
        subscription.user.first_name.toLowerCase().includes(search.toLowerCase()) ||
        subscription.user.email.toLowerCase().includes(search.toLowerCase()) ||
        subscription.plan.name.toLowerCase().includes(search.toLowerCase())
    );

    const paginate = (array, pageNumber) => {
        const startIndex = (pageNumber - 1) * itemsPerPage;
        return array.slice(startIndex, startIndex + itemsPerPage);
    };

    const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Subscription List</h2>

            {/* Search Input */}
            <div className="mb-3 d-flex justify-content-end">
                <input
                    type="text"
                    className="form-control w-auto"
                    placeholder="Search by Name, Plan, Email..."
                    value={search}
                    onChange={handleSearchChange}
                    style={{ maxWidth: '400px' }}
                />
            </div>

            {/* Loading and Error Messages */}
            {loading && <div className="alert alert-info text-center">Loading...</div>}
            {error && <div className="alert alert-danger text-center">{error}</div>}

            {/* Subscription Table */}
            {filteredSubscriptions.length === 0 ? (
                <div className="alert alert-warning text-center">No subscriptions found</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-bordered text-center">
                        <thead className="table-dark">
                            <tr>
                                <th>User Name</th>
                                <th>Plan Name</th>
                                <th>Email</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginate(filteredSubscriptions, currentPage).map(subscription => (
                                <tr key={subscription.id}>
                                    <td>{subscription.user.first_name}</td>
                                    <td>{subscription.plan.name}</td>
                                    <td>{subscription.user.email}</td>
                                    <td>${subscription.plan.price}</td>
                                    <td>{subscription.status}</td>
                                    <td>{dayjs(subscription.start_date).format('D MMM YYYY')}</td>
                                    <td>{dayjs(subscription.end_date).format('D MMM YYYY')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {filteredSubscriptions.length > 0 && (
                <div className="d-flex justify-content-end align-items-center mt-3">
                    <button
                        className="btn btn-secondary mx-2"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span>{`Page ${currentPage} of ${totalPages || 1}`}</span>
                    <button
                        className="btn btn-secondary mx-2"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default Subscription;
