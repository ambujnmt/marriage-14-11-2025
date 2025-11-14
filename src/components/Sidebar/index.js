import React from "react";
import { Link, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import {
  BiHomeAlt2,
  BiUser,
  BiCalendarEvent,
  BiMessageSquareDetail,
  BiChart,
  BiArchive,
  BiSolidMegaphone,
  BiFile,
  BiCog
} from "react-icons/bi";
import { AiOutlineLogout } from "react-icons/ai";
import defaultUser from "../../assets/images/logoapp.png";

const Sidebar = ({ collapsed, setCollapsed, handleLogout }) => {
  const location = useLocation();

  const handleLogoutClick = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to logout!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) handleLogout();
    });
  };

  const links = [
    { to: "/dashboard", icon: <BiHomeAlt2 />, label: "Dashboard" },
    { to: "/partner-list", icon: <BiUser />, label: "Users List" },
    { to: "/daily-check-in", icon: <BiCalendarEvent />, label: "Daily Check-in Ques." },
    { to: "/dealy-check-in-answer", icon: <BiMessageSquareDetail />, label: "Daily Check-in Ans." },
    { to: "/weakly-question", icon: <BiMessageSquareDetail />, label: "Weekly Questions" },
    { to: "/weakly-answer", icon: <BiMessageSquareDetail />, label: "Weekly Answers" },
    { to: "/result-analytics", icon: <BiChart />, label: "Results & Analytics" },
    { to: "/leaderboard-gamification", icon: <BiArchive />, label: "Leaderboard & Gamification" },
    { to: "/relationship-progres", icon: <BiSolidMegaphone />, label: "Relationship Progress" },
    { to: "/recomendation-engine", icon: <BiFile />, label: "Recommendations Engine" },
    { to: "/daily-rating-list", icon: <BiFile />, label: "Daily Rating" },
    { to: "/weakly-rating-list", icon: <BiFile />, label: "Weekly Rating" },
    { to: "/plan-list", icon: <BiFile />, label: "Plans Management" },
    { to: "/subscription-list", icon: <BiFile />, label: "Subscription Plans" },
    { to: "/settings/profile", icon: <BiCog />, label: "Profile Settings" },
  ];

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Logo */}
      <div className="sidebar-header text-center border-bottom py-3">
        <img src={defaultUser} alt="App Logo" className="sidebar-logo" />
      </div>

      {/* Links */}
      <ul className="nav flex-column mt-3 flex-grow-1">
        {links.map((link, index) => (
          <li key={index} className="nav-item">
            <Link
              to={link.to}
              className={`nav-link d-flex align-items-center ${
                location.pathname === link.to ? "active" : ""
              }`}
              title={collapsed ? link.label : ""}
            >
              <span className="icon me-2 fs-5">{link.icon}</span>
              {!collapsed && <span className="label">{link.label}</span>}
            </Link>
          </li>
        ))}
      </ul>

      {/* Logout */}
      <div className="p-3 border-top">
        <button
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={handleLogoutClick}
          title={collapsed ? "Logout" : ""}
        >
          <AiOutlineLogout />
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
