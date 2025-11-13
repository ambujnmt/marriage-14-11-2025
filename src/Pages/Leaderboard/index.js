import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Leaderboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("https://site2demo.in/marriageapp/api/reletionship-all-list")
            .then((res) => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then((json) => {
                setData(json);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="text-center my-5">Loading...</div>;

    if (error) return <div className="alert alert-danger text-center my-5">Error: {error}</div>;

    return (
        <div className="container my-5">
            <h1 className="text-center mb-4">Your Relationship Stats</h1>

            <div className="row mb-5">
                <div className="col-md-2 col-sm-4 mb-3" >
                    <div className="card text-center">
                        <div className="card-body">
                            <h5 className="card-title">User Score</h5>
                            <p className="card-text">{data.user_score}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-2 col-sm-4 mb-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h5 className="card-title">Level</h5>
                            <p className="card-text">{data.level}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-2 col-sm-4 mb-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h5 className="card-title">Streak Days</h5>
                            <p className="card-text">{data.streak_days}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-sm-6 mb-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h5 className="card-title">Regional Avg</h5>
                            <p className="card-text">{data.regional_avg}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-sm-6 mb-3">
                    <div className="card text-center">
                        <div className="card-body">
                            <h5 className="card-title">Top 10 Avg</h5>
                            <p className="card-text">{data.top_10_avg}</p>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="mb-3 text-center">Leaderboard</h2>
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th>Rank</th>
                            <th>Name</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.leaderboard.map((user, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{user.name}</td>
                                <td>{user.score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard;
