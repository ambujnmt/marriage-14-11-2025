import React, { useState, useEffect } from "react";
import {
  Bar,
  Line,
  Pie,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  LineElement,
  PointElement
);

const Resultanalytics = () => {
  const [data, setData] = useState(null);
  const BASE_URL = "https://site2demo.in/marriageapp/api";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/all-result-anaylytics-list`);
        const result = await response.json();
        if (result.status) {
          setData(result);
        } else {
          console.error("Error fetching data");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);

  const overallScoreData = {
    labels: ["Score"],
    datasets: [
      {
        label: "Overall Score",
        data: [data?.scores?.[0]?.value || 0],
        backgroundColor: "rgba(13, 110, 253, 0.6)",
      },
    ],
  };

  const trendsData = {
    labels: data?.trends?.map((trend) => trend.date) || [],
    datasets: [
      {
        label: "Score Trend",
        data: data?.trends?.map((trend) => trend.score) || [],
        borderColor: "rgba(25, 135, 84, 1)",
        fill: false,
      },
    ],
  };

  const progressReportsData = {
    labels: data?.progress_reports?.map((report) => report.category) || [],
    datasets: [
      {
        data: data?.progress_reports?.map((report) => report.value) || [],
        backgroundColor: [
          "rgba(13, 110, 253, 0.6)",
          "rgba(255, 193, 7, 0.6)",
          "rgba(220, 53, 69, 0.6)",
        ],
      },
    ],
  };

  const weekVsLastWeekData = {
    labels: ["Communication", "Trust"],
    datasets: [
      {
        label: "Week vs Last Week",
        data: [
          parseInt(data?.week_vs_last_week?.communication?.replace("%", "") || 0),
          parseInt(
            data?.week_vs_last_week?.trust === "Stable"
              ? 0
              : data?.week_vs_last_week?.trust?.replace("%", "") || 0
          ),
        ],
        backgroundColor: [
          "rgba(13, 202, 240, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
      },
    ],
  };

  return (
    <div className="container my-4">
      <h3 className="text-center mb-4 fw-bold text-primary">
        Result Analytics
      </h3>

      {!data ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Overall Score */}
          <div className="col-md-6 col-lg-6">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-primary text-white fw-semibold">
                Overall Score
              </div>
              <div className="card-body">
                <Bar data={overallScoreData} />
              </div>
            </div>
          </div>

          {/* Trends */}
          <div className="col-md-6 col-lg-6">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-success text-white fw-semibold">
                Trends
              </div>
              <div className="card-body">
                <Line data={trendsData} />
              </div>
            </div>
          </div>

          {/* Progress Reports */}
          <div className="col-md-6 col-lg-6">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-warning fw-semibold">
                Progress Reports
              </div>
              <div className="card-body">
                <Pie data={progressReportsData} />
              </div>
            </div>
          </div>

          {/* Week vs Last Week */}
          <div className="col-md-6 col-lg-6">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-info text-dark fw-semibold">
                Week vs Last Week
              </div>
              <div className="card-body">
                <Bar data={weekVsLastWeekData} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resultanalytics;
