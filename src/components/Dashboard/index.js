import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [partnerData, setPartnerData] = useState([]);
  const [partnerStats, setPartnerStats] = useState([
    { type: "Male", count: 0 },
    { type: "Female", count: 0 },
  ]);

  const navigate = useNavigate();

  // Redirect to login if not logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch partner data from API
  useEffect(() => {
    const fetchPartnerData = async () => {
      try {
        const response = await fetch(
          "https://site2demo.in/marriageapp/api/partner-list"
        );
        const result = await response.json();

        if (result.status && Array.isArray(result.data)) {
          setPartnerData(result.data);

          const maleCount = result.data.filter(
            (p) => p.partner?.toLowerCase() === "husband"
          ).length;
          const femaleCount = result.data.filter(
            (p) => p.partner?.toLowerCase() === "wife"
          ).length;

          setPartnerStats([
            { type: "Male", count: maleCount },
            { type: "Female", count: femaleCount },
          ]);
        } else {
          console.error("Invalid API response format");
        }
      } catch (error) {
        console.error("Error fetching partner data:", error);
      }
    };

    fetchPartnerData();
  }, []);

  return (
    <div className="container-fluid py-4">
      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card text-white bg-info shadow">
            <div className="card-header d-flex align-items-center">
              <span className="me-2 fs-4">♂</span>
              <h6 className="mb-0">Total Male</h6>
            </div>
            <div className="card-body text-center">
              <h2>{partnerStats[0].count}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-white bg-primary shadow">
            <div className="card-header d-flex align-items-center">
              <span className="me-2 fs-4">♀</span>
              <h6 className="mb-0">Total Female</h6>
            </div>
            <div className="card-body text-center">
              <h2>{partnerStats[1].count}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-white bg-success shadow">
            <div className="card-header d-flex align-items-center">
              <span className="me-2 fs-4">💍</span>
              <h6 className="mb-0">Total Users</h6>
            </div>
            <div className="card-body text-center">
              <h2>{partnerData.length}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Partner Distribution Chart */}
      <div className="row">
        <div className="col-12">
          <div className="card bg-white shadow-sm">
            <div className="card-header fw-bold">Partner Distribution</div>
            <div className="card-body" style={{ height: "350px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={partnerStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
