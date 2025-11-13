import React from "react";

const Header = ({ toggleSidebar, sidebarVisible }) => {
  return (
    <header className={`header ${!sidebarVisible ? "collapsed" : ""}`}>
      <div
        onClick={toggleSidebar}
        style={{ cursor: "pointer", fontSize: "22px", fontWeight: "bold" }}
      >
        
      </div>
      <div className="d-flex align-items-center">
        <span className="me-3">🔔</span>
        <span>👤 Admin</span>
      </div>
    </header>
  );
};

export default Header;
