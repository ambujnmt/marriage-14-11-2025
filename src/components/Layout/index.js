import React, { useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import { BiBell } from "react-icons/bi";
import { FaBars } from "react-icons/fa";

const Layout = ({ children, handleLogout }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <div className={`layout-container ${collapsed ? "collapsed" : ""}`}>
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} handleLogout={handleLogout} />

      {/* Header */}
      <header className="header">
        <button
          className="btn btn-link text-dark fs-5"
          onClick={toggleSidebar}
        >
          <FaBars />
        </button>
        <div className="d-flex align-items-center gap-3">
          <BiBell className="fs-4" />
          <span className="fw-semibold">Admin</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
